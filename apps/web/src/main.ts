
async function initApplication() {
    // 启动应用并挂载
    // vue应用主要逻辑及视图
    const { bootstrap } = await import('./bootstrap');
    const { preferences } = await import('./preferences');
    await bootstrap(preferences.app.name);
}

initApplication();