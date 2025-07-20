module.exports = {
    apps: [
        {
            name: 'chess-game',
            script: 'npx',
            args: 'serve -s ./dist -p 8002',
            cwd: './',  // 设置工作目录
            env: {
                NODE_ENV: 'production',
            },
        },
    ],
};