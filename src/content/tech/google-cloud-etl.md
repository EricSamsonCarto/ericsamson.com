---
title: "Automating a Recurring Data ETL Pipeline Entirely Within GCP"
description: "Creating a large scale google cloud ETL pipeline that transfers data from a GCP bucket into a posgreSQL database."
date: 2026-03-14
thumbnail: "/public/images/writing/tech/gcp_pipeline.jpg"
---

A vendor delivers data to us via a Google Cloud Storage bucket once a month. The file is large, around 180 gbs, and the delivery date isn't fixed. It shows up sometime around the same week each month, but there's no exact timestamp we can count on. Rather than checking manually or building a fragile polling script, we automated the entire ETL process within GCP using four services:

- **Cloud Scheduler** — triggers everything on a nightly schedule
- **Cloud Run Function** — checks for the file and spins up a VM if it finds one
- **Compute Engine** — an ephemeral VM that runs the actual import
- **Artifact Registry** — hosts the Docker image the VM pulls at startup

Here's the flow: Cloud Scheduler fires every night and triggers the Cloud Function. The Cloud Function checks the GCS bucket. If there's no file, it quits. Nothing happens, no cost. If there *is* a file, it spins up a new VM configured to run our Docker image automatically on startup. That container streams the data file directly into our PostgreSQL database, builds indexes, cleans up after itself, and then deletes the VM. If something goes wrong, the VM still deletes itself, that way we're not paying for a broken VM to sit idle.

We also get GCP log-based alerts when the import succeeds, when it fails, and when the VM deletes itself, so we always know what happened without having to go check.

The whole thing costs around $5–6/month for a monthly import. Pretty cheap for a fully automated pipeline handling a large dataset. Certainly cheaper than me doing it manually.

---

## Guide

### Phase 1: Service Account Setup

Start by creating three service accounts — one for each component that needs its own identity. Keeping them separate limits the blast radius if credentials are ever compromised, and it lets you grant the minimum permissions needed for each job.

**Cloud Scheduler SA** — just needs to call the Cloud Function:
- Cloud Run Invoker

**Cloud Function SA** — needs to check existing VMs and create new ones:
- Compute Instance Admin (v1)
- Service Account User
- Storage Object Viewer

**VM SA** — needs to read the data file, fetch secrets, write logs, and delete itself when done:
- Storage Object Viewer
- Storage Object Admin *(for deleting the source file after import)*
- Secret Manager Secret Accessor
- Logs Writer
- Compute Instance Admin (v1) *(for self-deletion)*

For each one:
1. Go to **IAM & Admin → Service Accounts**
2. Click **Create Service Account** and give it a descriptive name
3. Assign the roles listed above

---

### Phase 2: Secret Manager Setup

The VM needs database credentials at runtime. We store them in Secret Manager and fetch them inside the container. Nothing sensitive ever lives in code or environment variables baked into the image.

Add the following three secrets:
- Database username
- Database password
- Database host

You'll reference these in the `config.py` in the next step.

---

### Phase 3: Fill In the Config Files

The repo has two `config.py` files — one for the Cloud Function and one for the VM container. All project-specific values live here. The code itself has no hardcoded project IDs, bucket names, or credentials.

**`cloud_function/config.py`** controls how the VM gets created:

```python
project_id = 'your-project-id'
vm_names_to_check = ['your-vm-name']  # any running VM matching this blocks a new run
bucket_name = 'your-data-bucket'
zip_file_ends_with = '.sql.gz'
instance_name_str = 'data-etl'        # timestamp appended automatically
zone = 'us-central1-b'
container_image = 'us-central1-docker.pkg.dev/your-project/your-repo/your-image:latest'
container_name = 'data-etl'
service_account_email = 'your-vm-sa@your-project.iam.gserviceaccount.com'
```

The `vm_names_to_check` list is worth calling out. The Cloud Function scans all running VMs before doing anything — if it finds one whose name contains any string from that list, it exits early. This prevents other imports from overlapping if a different run is still in progress when the scheduler fires again. For our team, we have a lot of these running multiple times throughout the month, we don't want multiple running at once clogging up database I/O.

**`data_etl_vm/config.py`** controls the import job itself that will be a docker container:

```python
project_id = 'your-project-id'
bucket_name = 'your-data-bucket'
zip_file_ends_with = '.sql.gz'
db_user_secret_id = 'your-db-user-secret'
db_password_secret_id = 'your-db-password-secret'
db_host_secret_id = 'your-db-host-secret'
db_port = '5432'
db_name = 'your-database-name'
index_dir = '/app'
index_timeout_minutes = 120
auto_shutdown = True
```

---

### Phase 4: The VM Container

The VM runs a Docker container. The entry point is `main.py`, which orchestrates the full pipeline:

1. **Verify the file is there** (`find_gz_file`) — we know the Cloud Function found it, but a double-check costs nothing and avoids a confusing failure later
2. **Fetch DB credentials** (`get_db_config`) — pulls the three secrets from Secret Manager and assembles a connection config dict
3. **Stream the import** (`run_psql_import`) — this is the core of the whole thing:

```python
def run_psql_import(gs_zip_path: str, db_config: Dict[str, str]) -> None:
    os.environ['PGPASSWORD'] = db_config['password']

    statement = (
        f"gsutil cat {gs_zip_path} | gunzip | "
        f"psql -h {db_config['host']} "
        f"-p {db_config['port']} "
        f"-U {db_config['user']} "
        f"-d {db_config['database']} "
        f"-v ON_ERROR_STOP=1"
    )

    subprocess.run(statement, shell=True, check=True)
```

Rather than downloading the file first, we stream it — `gsutil cat` pipes directly into `gunzip` which pipes directly into `psql`. For a large file this saves a lot of time and avoids needing extra disk space. For my dataset this typically runs for a little over an hour.

4. **Run post-import SQL** (`create_indexes`) — after the data is in, we execute `create_indexes.sql`. This is where you add your indexes, rename tables, create views, or do any other finalization. The timeout is configurable in `config.py`.

5. **Clean up** — delete the source file from GCS (`delete_file`) and delete the VM (`shutdown_vm`). The VM self-deletion works by calling the GCE metadata server to get the instance name, zone, and project, then issuing a delete request via the Compute API. This runs in a `finally` block, so it fires whether the import succeeded or failed.

The repo structure for the container:

```
data_etl_vm/
├── core/
│   ├── __init__.py
│   └── sql_import_funcs.py
├── sql/
│   └── create_indexes.sql
├── config.py
├── dockerfile
├── main.py
└── requirements.txt
```

And the Dockerfile:

```dockerfile
FROM python:3.11-slim

RUN apt-get update && apt-get install -y \
    postgresql-client curl gnupg lsb-release \
    && rm -rf /var/lib/apt/lists/*

RUN echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | \
    tee -a /etc/apt/sources.list.d/google-cloud-sdk.list && \
    curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | \
    gpg --dearmor -o /usr/share/keyrings/cloud.google.gpg && \
    apt-get update && apt-get install -y google-cloud-cli && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY config.py .
COPY core/ ./core/
COPY main.py .
COPY sql/create_indexes.sql .

CMD ["python", "main.py"]
```

We need `google-cloud-cli` for `gsutil`. The rest is standard Python.

> **Tip:** If you want to keep the VM alive after a run to inspect logs, set `AUTO_SHUTDOWN=false` as an environment variable at runtime. The code checks for this env var and uses it to override the `auto_shutdown` value from `config.py` — no container rebuild needed.

---

### Phase 5: Build and Push the Docker Image

First, create an Artifact Registry repository to hold the image: go to **Artifact Registry → Create Repository**, set the format to Docker, choose your region, and give it a name.

Then, with Docker running on your desktop, from inside the `data_etl_vm/` directory:

**Build:**
```bash
docker build -t your-image-name .
```

**Tag for Artifact Registry:**
```bash
docker tag your-image-name REGION-docker.pkg.dev/YOUR_PROJECT/YOUR_REPO/YOUR_IMAGE
```

**Authenticate:**
```bash
gcloud auth print-access-token | docker login -u oauth2accesstoken --password-stdin https://REGION-docker.pkg.dev
```

**Push:**
```bash
docker push REGION-docker.pkg.dev/YOUR_PROJECT/YOUR_REPO/YOUR_IMAGE
```

The full image path from the tag command is what goes into `container_image` in `cloud_function/config.py`.

---

### Phase 6: Deploy the Cloud Function

The Cloud Function lives in `cloud_function/gcp_cloud_function.py` with its own `config.py`. It's an HTTP-triggered function, so it can be called by Cloud Scheduler, a webhook, or anything that can make an HTTP request.

To deploy, go through the GCP console:
1. Go to **Cloud Run → Write a Function**
2. Choose Python 3.11, HTTP trigger, require authentication, internal ingress
3. Assign the Cloud Function service account under Security
4. In the **Source** tab, paste `gcp_cloud_function.py` into `main.py`, add a `config.py` with your values, and add `requirements.txt`

The function does two checks before creating anything. First it scans all running VMs — if any match a name in `vm_names_to_check`, it exits. Then it checks the bucket for a file ending with the configured extension. Only if both pass does it call `create_vm()`.

---

### Phase 7: Set Up Cloud Scheduler

Create a Cloud Scheduler job to trigger the function on your schedule:

1. Go to **Cloud Scheduler → Create Job**
2. Set the **Frequency** using cron syntax — e.g. `5 22 * * *` for 10:05 PM nightly
3. Set your **Timezone**
4. Under **Execution**, set:
   - Target type: HTTP
   - URL: your Cloud Function URL from Phase 6
   - HTTP method: GET
   - Auth header: OIDC token
   - Service account: your Scheduler SA

Hit **Run Now** to verify the end-to-end flow and check the Cloud Function logs.

---

### Phase 8: Set Up Cloud Logging Alerts

The last piece is visibility. Go to **Logging → Logs Explorer** and create a log-based alert for each of the following queries.

**Import succeeded:**
```
resource.type="gce_instance"
textPayload=~"data import completed successfully"
```

**Import failed:**
```
resource.type="gce_instance"
textPayload=~"data import failed"
severity="ERROR"
```

**VM deleted itself:**
```
resource.type="gce_instance"
textPayload=~"deleting vm"
```

In the query results bar, click **Actions → Create Log Alert** to wire each one up to an email notification channel. Now you'll know immediately if something went wrong or right.

> **Note:** These queries use `textPayload` because the container uses Python's standard `logging` module. After your first real run, open Logs Explorer, find a log entry from the VM, and click into it to confirm the field structure. It's always best to sort of set these alerts up manually based on how you are running it personally, I always just run it once, look into the logs, and then create alerts based on the results I see.

---

## Full Pipeline Flow

Here's the whole thing from the front to the back:

1. Cloud Scheduler fires on your configured schedule
2. Cloud Function checks for any running VMs matching `vm_names_to_check` — exits if found
3. Cloud Function checks the GCS bucket for a matching file — exits if not found
4. File found → Cloud Function creates an ephemeral VM
5. VM starts, pulls the container image from Artifact Registry
6. Container runs `main.py`:
   - Reads DB credentials from Secret Manager
   - Streams data from GCS → PostgreSQL (`gsutil | gunzip | psql`)
   - Executes `create_indexes.sql`
   - Deletes the source file from GCS
   - Deletes the VM
7. Cloud Logging alerts fire on success, failure, or VM deletion

---

The full source is available on GitHub: [GCP-Data-ETL]()
