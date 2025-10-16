---
title: "Two GitHub Accounts, One Computer"
description: "Ugh, I have a work github account, and a personal github account"
date: 2025-10-16
thumbnail: "/public/images/writing/tech/github-juggling.jpg"
---

For a myriad of reason, I have two GitHub accounts. One for my job, and one for personal projects. This is mostly company preference, some allow you to just use your personal account and add your company's organization to that. Others do not.

This is fine, but sometimes I get an idea regarding a personal project (like this site) that I just have to implement or update. Of course, I do not want to make these changes from my work GitHub account, so I started down the road of figuring out a process to do this. Previously, I have just used VScode in the browser to handle this, but it doesn't allow you to utilize the large amount of extensions available to you when running the Desktop version. I figured I would try my hand at fixing this myself, and my first attempt sort of worked! With a bit of an annoying hang up:

### First Attempt (Not Really the Best Way)

I use VScode, so if you are doing your own git commands within a command line, some of this may not be relevant for you (and props to you, btw),

1. In VScode bottom left, sign in with your desired GitHub account (sign out of professional one, if you are logged in).
2. Open a terminal and change your global user information to your personal GitHub account:

```bash
git config --global [user.name](http://user.name/) "user"
git config --global user.email "user@example.com"
```

1. Sign out of GitHub in bottom left of VScode, then close VScode
2. VScode keeps your user information saved within windows credentials. When you sign in and out, it doesn’t update these credentials, so you have to go into your window credentials and remove the git entries:
    - go to credential manager -> windows credentials
    - remove the entry: git:[https://github.com](https://github.com/)
    - remove the entry: git:[https://OtherUserName@github.com](https://OtherUserName@github.com/)
3. Re-open VScode, now sign in to your personal account.
4. Clone the repository you want to code in.
5. Update the local git config on this repository. That way, you will always use your personal username and email for this repository:

```bash
git config --local user.name "user"
git config --local user.email "user@example.com"
```

Now when you push changes in VScode for this repo, changes will come from your personal account!

However: you have to repeat step 4 every time you sign in and out of VScode. Huge pain, and makes this not really a long term solution. I decided to google my way out of it, and found a lot of stack exchange articles about this.

GitHub has a way around this by creating [SSH Keys](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent) and linking them to your repo.

### Second Attempt (The Correct Way)

1. Generate an SSH key for your personal GitHub account:

```bash
ssh-keygen -t rsa -b 4096 -C "[your-personal-email@example.com](mailto:your-personal-email@example.com)"
```

You can name your ssh key or set a passcode if you would like, or just press enter twice to use defaults.

1. Locate where the new pub file is created (if by default, it would be called “id_rsa.pub”). Open that in a text editor, and copy it’s contents.
2. Go to the [keys section under setting on GitHub](https://github.com/settings/keys), while signed into your personal account. Choose Add SSH Key, give it a title and description and add the copied contents.
3. Within your local folder where your SSH keys were created, create a config text file. Within it, add the following information

```bash
Host github.com-personal
	HostName github.com
	User git
	IdentityFile ~/.ssh/id_rsa
```

1. Test the SSH connection. Open a terminal and run:

```bash
ssh -T git@github.com
```

If prompted about the authenticity of the host, verify the fingerprint and type “yes” to continue.

1. Open VS Code and the personal repository. run the command:

```bash
git remote set-url origin git@github.com:username/repository.git
```

1. Set the local Git config to use your personal usernames:

```bash
git config --local user.name "user"
git config --local user.email "user@example.com"
```

Make sure you are signed into your personal GitHub account within VScode, then attempt to do a git action. If set up correctly, it should use the SSH and utilize the correct credentials setup within the project! A bit annoying, but way better than absolutely nothing.