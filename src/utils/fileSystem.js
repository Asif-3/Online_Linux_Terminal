// Virtual File System for Linux Terminal Emulation

const DEFAULT_FS = {
    '/': {
        type: 'dir', permissions: 'drwxr-xr-x', owner: 'root', group: 'root',
        children: {
            'home': {
                type: 'dir', permissions: 'drwxr-xr-x', owner: 'root', group: 'root',
                children: {
                    'asif': {
                        type: 'dir', permissions: 'drwxr-xr-x', owner: 'asif', group: 'asif',
                        children: {
                            'Documents': {
                                type: 'dir', permissions: 'drwxr-xr-x', owner: 'asif', group: 'asif',
                                children: {
                                    'notes.txt': { type: 'file', permissions: '-rw-r--r--', owner: 'asif', group: 'asif', content: 'Welcome to ASIF Linux Terminal!\nThis is a virtual file system.\nYou can create, edit, and manage files here.\n', size: 95 },
                                    'project.md': { type: 'file', permissions: '-rw-r--r--', owner: 'asif', group: 'asif', content: '# My Project\n\n## Description\nA sample project file.\n\n## Features\n- Feature 1\n- Feature 2\n- Feature 3\n', size: 120 },
                                    'todo.txt': { type: 'file', permissions: '-rw-r--r--', owner: 'asif', group: 'asif', content: '1. Learn Linux commands\n2. Practice file management\n3. Master shell scripting\n4. Configure servers\n5. Deploy applications\n', size: 130 }
                                }
                            },
                            'Downloads': {
                                type: 'dir', permissions: 'drwxr-xr-x', owner: 'asif', group: 'asif',
                                children: {
                                    'setup.sh': { type: 'file', permissions: '-rwxr-xr-x', owner: 'asif', group: 'asif', content: '#!/bin/bash\necho "Setting up environment..."\napt update && apt upgrade -y\necho "Done!"\n', size: 80 }
                                }
                            },
                            'Desktop': {
                                type: 'dir', permissions: 'drwxr-xr-x', owner: 'asif', group: 'asif',
                                children: {}
                            },
                            'Pictures': {
                                type: 'dir', permissions: 'drwxr-xr-x', owner: 'asif', group: 'asif',
                                children: {}
                            },
                            'Music': {
                                type: 'dir', permissions: 'drwxr-xr-x', owner: 'asif', group: 'asif',
                                children: {}
                            },
                            'Videos': {
                                type: 'dir', permissions: 'drwxr-xr-x', owner: 'asif', group: 'asif',
                                children: {}
                            },
                            '.bashrc': { type: 'file', permissions: '-rw-r--r--', owner: 'asif', group: 'asif', content: '# ~/.bashrc\nexport PS1="\\u@\\h:\\w$ "\nexport PATH="/usr/local/bin:/usr/bin:/bin"\nalias ll="ls -la"\nalias la="ls -a"\nalias ..="cd .."\n', size: 150 },
                            '.profile': { type: 'file', permissions: '-rw-r--r--', owner: 'asif', group: 'asif', content: '# ~/.profile\nif [ -f ~/.bashrc ]; then\n  . ~/.bashrc\nfi\n', size: 60 },
                            'hello.py': { type: 'file', permissions: '-rw-r--r--', owner: 'asif', group: 'asif', content: '#!/usr/bin/env python3\nprint("Hello, World!")\nprint("Welcome to ASIF Terminal")\n\nfor i in range(5):\n    print(f"Count: {i}")\n', size: 120 },
                            'script.sh': { type: 'file', permissions: '-rwxr-xr-x', owner: 'asif', group: 'asif', content: '#!/bin/bash\n# A sample shell script\necho "System Information:"\nuname -a\necho "\\nDisk Usage:"\ndf -h\necho "\\nMemory Usage:"\nfree -m\n', size: 140 }
                        }
                    }
                }
            },
            'etc': {
                type: 'dir', permissions: 'drwxr-xr-x', owner: 'root', group: 'root',
                children: {
                    'hostname': { type: 'file', permissions: '-rw-r--r--', owner: 'root', group: 'root', content: 'asif-linux\n', size: 11 },
                    'hosts': { type: 'file', permissions: '-rw-r--r--', owner: 'root', group: 'root', content: '127.0.0.1\tlocalhost\n127.0.1.1\tasif-linux\n::1\t\tlocalhost ip6-localhost\n', size: 75 },
                    'passwd': { type: 'file', permissions: '-rw-r--r--', owner: 'root', group: 'root', content: 'root:x:0:0:root:/root:/bin/bash\nasif:x:1000:1000:ASIF:/home/asif:/bin/bash\nnobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin\n', size: 150 },
                    'shadow': { type: 'file', permissions: '-rw-------', owner: 'root', group: 'shadow', content: 'root:$6$rounds=65536$salt$hash:19000:0:99999:7:::\nasif:$6$rounds=65536$salt$hash:19000:0:99999:7:::\n', size: 120 },
                    'group': { type: 'file', permissions: '-rw-r--r--', owner: 'root', group: 'root', content: 'root:x:0:\nadm:x:4:asif\nsudo:x:27:asif\nasif:x:1000:\n', size: 60 },
                    'os-release': { type: 'file', permissions: '-rw-r--r--', owner: 'root', group: 'root', content: 'NAME="ASIF Linux"\nVERSION="1.0"\nID=asiflinux\nPRETTY_NAME="ASIF Linux 1.0"\nHOME_URL="https://asif-terminal.vercel.app"\n', size: 140 },
                    'resolv.conf': { type: 'file', permissions: '-rw-r--r--', owner: 'root', group: 'root', content: 'nameserver 8.8.8.8\nnameserver 8.8.4.4\n', size: 40 },
                    'fstab': { type: 'file', permissions: '-rw-r--r--', owner: 'root', group: 'root', content: '# /etc/fstab\n/dev/sda1  /     ext4  defaults  0 1\n/dev/sda2  /home ext4  defaults  0 2\n/dev/sda3  swap  swap  defaults  0 0\n', size: 120 }
                }
            },
            'var': {
                type: 'dir', permissions: 'drwxr-xr-x', owner: 'root', group: 'root',
                children: {
                    'log': {
                        type: 'dir', permissions: 'drwxr-xr-x', owner: 'root', group: 'root',
                        children: {
                            'syslog': { type: 'file', permissions: '-rw-r-----', owner: 'root', group: 'adm', content: 'Feb 15 12:00:00 asif-linux kernel: [    0.000000] Linux version 6.2.0\nFeb 15 12:00:01 asif-linux systemd[1]: Started ASIF Terminal.\nFeb 15 12:00:02 asif-linux systemd[1]: Reached target Multi-User System.\n', size: 200 },
                            'auth.log': { type: 'file', permissions: '-rw-r-----', owner: 'root', group: 'adm', content: 'Feb 15 12:00:00 asif-linux sshd[1234]: Accepted password for asif\nFeb 15 12:00:01 asif-linux sudo: asif : TTY=pts/0 ; COMMAND=/bin/ls\n', size: 140 }
                        }
                    },
                    'tmp': {
                        type: 'dir', permissions: 'drwxrwxrwt', owner: 'root', group: 'root',
                        children: {}
                    }
                }
            },
            'usr': {
                type: 'dir', permissions: 'drwxr-xr-x', owner: 'root', group: 'root',
                children: {
                    'bin': {
                        type: 'dir', permissions: 'drwxr-xr-x', owner: 'root', group: 'root',
                        children: {
                            'python3': { type: 'file', permissions: '-rwxr-xr-x', owner: 'root', group: 'root', content: '', size: 5000 },
                            'node': { type: 'file', permissions: '-rwxr-xr-x', owner: 'root', group: 'root', content: '', size: 40000 },
                            'git': { type: 'file', permissions: '-rwxr-xr-x', owner: 'root', group: 'root', content: '', size: 3000 },
                            'vim': { type: 'file', permissions: '-rwxr-xr-x', owner: 'root', group: 'root', content: '', size: 3000 },
                            'nano': { type: 'file', permissions: '-rwxr-xr-x', owner: 'root', group: 'root', content: '', size: 2000 }
                        }
                    },
                    'local': {
                        type: 'dir', permissions: 'drwxr-xr-x', owner: 'root', group: 'root',
                        children: {
                            'bin': { type: 'dir', permissions: 'drwxr-xr-x', owner: 'root', group: 'root', children: {} },
                            'lib': { type: 'dir', permissions: 'drwxr-xr-x', owner: 'root', group: 'root', children: {} }
                        }
                    },
                    'share': {
                        type: 'dir', permissions: 'drwxr-xr-x', owner: 'root', group: 'root',
                        children: {}
                    }
                }
            },
            'bin': {
                type: 'dir', permissions: 'drwxr-xr-x', owner: 'root', group: 'root',
                children: {
                    'bash': { type: 'file', permissions: '-rwxr-xr-x', owner: 'root', group: 'root', content: '', size: 1200 },
                    'sh': { type: 'file', permissions: '-rwxr-xr-x', owner: 'root', group: 'root', content: '', size: 120 },
                    'ls': { type: 'file', permissions: '-rwxr-xr-x', owner: 'root', group: 'root', content: '', size: 140 },
                    'cat': { type: 'file', permissions: '-rwxr-xr-x', owner: 'root', group: 'root', content: '', size: 50 },
                    'cp': { type: 'file', permissions: '-rwxr-xr-x', owner: 'root', group: 'root', content: '', size: 150 },
                    'mv': { type: 'file', permissions: '-rwxr-xr-x', owner: 'root', group: 'root', content: '', size: 130 },
                    'rm': { type: 'file', permissions: '-rwxr-xr-x', owner: 'root', group: 'root', content: '', size: 80 },
                    'mkdir': { type: 'file', permissions: '-rwxr-xr-x', owner: 'root', group: 'root', content: '', size: 60 },
                    'grep': { type: 'file', permissions: '-rwxr-xr-x', owner: 'root', group: 'root', content: '', size: 250 }
                }
            },
            'tmp': {
                type: 'dir', permissions: 'drwxrwxrwt', owner: 'root', group: 'root',
                children: {}
            },
            'dev': {
                type: 'dir', permissions: 'drwxr-xr-x', owner: 'root', group: 'root',
                children: {
                    'null': { type: 'file', permissions: 'crw-rw-rw-', owner: 'root', group: 'root', content: '', size: 0 },
                    'zero': { type: 'file', permissions: 'crw-rw-rw-', owner: 'root', group: 'root', content: '', size: 0 },
                    'random': { type: 'file', permissions: 'crw-rw-rw-', owner: 'root', group: 'root', content: '', size: 0 },
                    'sda': { type: 'file', permissions: 'brw-rw----', owner: 'root', group: 'disk', content: '', size: 0 },
                    'sda1': { type: 'file', permissions: 'brw-rw----', owner: 'root', group: 'disk', content: '', size: 0 },
                    'sda2': { type: 'file', permissions: 'brw-rw----', owner: 'root', group: 'disk', content: '', size: 0 },
                    'tty': { type: 'file', permissions: 'crw-rw-rw-', owner: 'root', group: 'tty', content: '', size: 0 }
                }
            },
            'proc': {
                type: 'dir', permissions: 'dr-xr-xr-x', owner: 'root', group: 'root',
                children: {
                    'cpuinfo': { type: 'file', permissions: '-r--r--r--', owner: 'root', group: 'root', content: 'processor\t: 0\nvendor_id\t: GenuineIntel\ncpu family\t: 6\nmodel name\t: Intel(R) Core(TM) i7-12700K\ncpu MHz\t\t: 3600.000\ncache size\t: 25600 KB\ncpu cores\t: 12\n', size: 180 },
                    'meminfo': { type: 'file', permissions: '-r--r--r--', owner: 'root', group: 'root', content: 'MemTotal:       16384000 kB\nMemFree:         8192000 kB\nMemAvailable:   12288000 kB\nBuffers:          512000 kB\nCached:          2048000 kB\nSwapTotal:       8192000 kB\nSwapFree:        8192000 kB\n', size: 200 },
                    'version': { type: 'file', permissions: '-r--r--r--', owner: 'root', group: 'root', content: 'Linux version 6.2.0-asif (gcc version 12.2.0) #1 SMP PREEMPT_DYNAMIC\n', size: 70 },
                    'uptime': { type: 'file', permissions: '-r--r--r--', owner: 'root', group: 'root', content: '86400.50 172800.00\n', size: 20 }
                }
            },
            'root': {
                type: 'dir', permissions: 'drwx------', owner: 'root', group: 'root',
                children: {
                    '.bashrc': { type: 'file', permissions: '-rw-r--r--', owner: 'root', group: 'root', content: '# ~/.bashrc for root\nexport PS1="root@\\h:\\w# "\n', size: 50 }
                }
            },
            'opt': {
                type: 'dir', permissions: 'drwxr-xr-x', owner: 'root', group: 'root',
                children: {}
            },
            'srv': {
                type: 'dir', permissions: 'drwxr-xr-x', owner: 'root', group: 'root',
                children: {}
            },
            'mnt': {
                type: 'dir', permissions: 'drwxr-xr-x', owner: 'root', group: 'root',
                children: {}
            }
        }
    }
};

export class VirtualFileSystem {
    constructor() {
        const saved = sessionStorage.getItem('asif_terminal_fs');
        if (saved) {
            try {
                this.root = JSON.parse(saved);
            } catch {
                this.root = JSON.parse(JSON.stringify(DEFAULT_FS['/']));
            }
        } else {
            this.root = JSON.parse(JSON.stringify(DEFAULT_FS['/']));
        }
    }

    save() {
        try {
            sessionStorage.setItem('asif_terminal_fs', JSON.stringify(this.root));
        } catch (e) {
            // Storage full
        }
    }

    resolvePath(path, cwd) {
        if (!path) return cwd;
        if (path === '~') return '/home/asif';
        if (path.startsWith('~/')) path = '/home/asif/' + path.slice(2);
        if (!path.startsWith('/')) {
            path = cwd === '/' ? '/' + path : cwd + '/' + path;
        }
        // Normalize path
        const parts = path.split('/').filter(Boolean);
        const resolved = [];
        for (const part of parts) {
            if (part === '.') continue;
            if (part === '..') { resolved.pop(); continue; }
            resolved.push(part);
        }
        return '/' + resolved.join('/');
    }

    getNode(path) {
        if (path === '/') return this.root;
        const parts = path.split('/').filter(Boolean);
        let current = this.root;
        for (const part of parts) {
            if (!current || current.type !== 'dir' || !current.children || !current.children[part]) {
                return null;
            }
            current = current.children[part];
        }
        return current;
    }

    getParentAndName(path) {
        const parts = path.split('/').filter(Boolean);
        const name = parts.pop();
        const parentPath = '/' + parts.join('/');
        const parent = this.getNode(parentPath || '/');
        return { parent, name, parentPath: parentPath || '/' };
    }

    listDir(path) {
        const node = this.getNode(path);
        if (!node || node.type !== 'dir') return null;
        return Object.entries(node.children || {}).map(([name, info]) => ({
            name,
            ...info,
            size: info.type === 'dir' ? 4096 : (info.size || (info.content || '').length)
        }));
    }

    createFile(path, content = '') {
        const { parent, name } = this.getParentAndName(path);
        if (!parent || parent.type !== 'dir') return false;
        if (!parent.children) parent.children = {};
        parent.children[name] = {
            type: 'file',
            permissions: '-rw-r--r--',
            owner: 'asif',
            group: 'asif',
            content: content,
            size: content.length,
            mtime: new Date().toISOString()
        };
        this.save();
        return true;
    }

    createDir(path, parents = false) {
        if (parents) {
            const parts = path.split('/').filter(Boolean);
            let currentPath = '';
            for (const part of parts) {
                currentPath += '/' + part;
                if (!this.exists(currentPath)) {
                    this.createDir(currentPath, false);
                }
            }
            return true;
        }
        const { parent, name } = this.getParentAndName(path);
        if (!parent || parent.type !== 'dir') return false;
        if (!parent.children) parent.children = {};
        if (parent.children[name]) return false;
        parent.children[name] = {
            type: 'dir',
            permissions: 'drwxr-xr-x',
            owner: 'asif',
            group: 'asif',
            children: {},
            mtime: new Date().toISOString()
        };
        this.save();
        return true;
    }

    deleteNode(path) {
        const { parent, name } = this.getParentAndName(path);
        if (!parent || !parent.children || !parent.children[name]) return false;
        delete parent.children[name];
        this.save();
        return true;
    }

    readFile(path) {
        const node = this.getNode(path);
        if (!node || node.type !== 'file') return null;
        return node.content || '';
    }

    writeFile(path, content) {
        const node = this.getNode(path);
        if (node && node.type === 'file') {
            node.content = content;
            node.size = content.length;
            node.mtime = new Date().toISOString();
            this.save();
            return true;
        }
        return this.createFile(path, content);
    }

    appendFile(path, content) {
        const node = this.getNode(path);
        if (node && node.type === 'file') {
            node.content = (node.content || '') + content;
            node.size = node.content.length;
            node.mtime = new Date().toISOString();
            this.save();
            return true;
        }
        return this.createFile(path, content);
    }

    copyNode(srcPath, destPath) {
        const srcNode = this.getNode(srcPath);
        if (!srcNode) return false;
        const copy = JSON.parse(JSON.stringify(srcNode));
        const { parent, name } = this.getParentAndName(destPath);
        if (!parent || parent.type !== 'dir') return false;
        if (!parent.children) parent.children = {};
        parent.children[name] = copy;
        this.save();
        return true;
    }

    moveNode(srcPath, destPath) {
        if (this.copyNode(srcPath, destPath)) {
            return this.deleteNode(srcPath);
        }
        return false;
    }

    exists(path) {
        return this.getNode(path) !== null;
    }

    isDir(path) {
        const node = this.getNode(path);
        return node && node.type === 'dir';
    }

    isFile(path) {
        const node = this.getNode(path);
        return node && node.type === 'file';
    }

    getSize(path) {
        const node = this.getNode(path);
        if (!node) return 0;
        if (node.type === 'file') return node.size || (node.content || '').length;
        return this._getDirSize(node);
    }

    _getDirSize(node) {
        if (node.type === 'file') return node.size || (node.content || '').length;
        let total = 4096;
        if (node.children) {
            for (const child of Object.values(node.children)) {
                total += this._getDirSize(child);
            }
        }
        return total;
    }

    tree(path, prefix = '', isLast = true) {
        const node = this.getNode(path);
        if (!node || node.type !== 'dir') return '';
        const entries = Object.entries(node.children || {}).sort((a, b) => a[0].localeCompare(b[0]));
        let result = '';
        entries.forEach(([name, child], index) => {
            const last = index === entries.length - 1;
            const connector = last ? '└── ' : '├── ';
            const color = child.type === 'dir' ? name : name;
            result += prefix + connector + color + '\n';
            if (child.type === 'dir') {
                const childPath = path === '/' ? '/' + name : path + '/' + name;
                const newPrefix = prefix + (last ? '    ' : '│   ');
                result += this.tree(childPath, newPrefix, last);
            }
        });
        return result;
    }

    find(startPath, pattern) {
        const results = [];
        this._findRecursive(startPath, pattern, results);
        return results;
    }

    _findRecursive(path, pattern, results) {
        const node = this.getNode(path);
        if (!node) return;
        const name = path.split('/').pop() || '/';
        if (this._matchPattern(name, pattern)) {
            results.push(path);
        }
        if (node.type === 'dir' && node.children) {
            for (const childName of Object.keys(node.children)) {
                const childPath = path === '/' ? '/' + childName : path + '/' + childName;
                this._findRecursive(childPath, pattern, results);
            }
        }
    }

    _matchPattern(name, pattern) {
        if (!pattern || pattern === '*') return true;
        // Simple glob matching
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$');
        return regex.test(name);
    }
}
