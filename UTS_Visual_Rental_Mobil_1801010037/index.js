    const electron = require("electron");
    const{v4:uuidv4} = require('uuid');
    uuidv4();

    const {
        app,
        BrowserWindow,
        Menu,
        ipcMain
    } = electron;

    let todayWindow;
    let formulirWindow;
    let listWindow;

    let penyewaMobil = [];

    app.on("ready", () => {
        todayWindow = new BrowserWindow({
            webPreferences: {
                nodeIntegration: true
            },
            title: "Aplikasi Rental Mobil"
        });

        todayWindow.loadURL(`file://${__dirname}/today.html`);
        todayWindow.on("closed", () => {

            app.quit();
            todayWindow = null;
        });

        const mainMenu = Menu.buildFromTemplate(menuTemplate);
        Menu.setApplicationMenu(mainMenu);
    });

    const listWindowCreator =() => {
        listWindow = new BrowserWindow ({
            webPreferences: {
                nodeIntegration: true
            },
            width: 600,
            height: 400,
            title: "Data Penyewa Mobil"
        });

        listWindow.setMenu(null);
        listWindow.loadURL(`file://${__dirname}/list.html`);
        listWindow.on("closed", () => (listWindow = null))
    };

    const formulirWindowCreator =() => {
        formulirWindow = new BrowserWindow ({
            webPreferences: {
                nodeIntegration: true
            },
            width: 600,
            height: 400,
            title: "Formulir Baru"
        });

        formulirWindow.setMenu(null);
        formulirWindow.loadURL(`file://${__dirname}/formulir.html`);
        formulirWindow.on("closed", () => (formulirWindow = null))
    };

    ipcMain.on("appointment:formulir", (event, appointment) => {
        appointment["id"]= uuidv4();
        appointment["done"]= 0;
        penyewaMobil.push(appointment);

        formulirWindow.close();

        console.log(penyewaMobil);
    });

    ipcMain.on("appointment:request:list", event => {
        listWindow.webContents.send('appointment:response:list', penyewaMobil);
    });
    ipcMain.on("appointment:request:today", event => {
        console.log("here2");
    });
    ipcMain.on("appointment:done", (event, id) => {
        console.log("here3");
    });


    const menuTemplate = [{
        label: "File",
        submenu: [{
            label: "Formulir",

            click(){
                formulirWindowCreator();
            }
        },
        {
            label: "Data Penyewa Mobil",
            click() {
                listWindowCreator();
            }
        },
        {
            label: "Keluar",
            accelerato: process.platform === "darwin" ? "command+K" : "Ctrl+K",
            click(){
                app.quit();
            }
        }
    ]
    
    },
    {
        label: "View",
        submenu: [{ role: "reload"}, {role: "toggledevtools"}]
    }
]