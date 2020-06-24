    const electron = require("electron");
    const{v4:uuidv4} = require('uuid');
    uuidv4();
    const fs = require('fs')

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

    fs.readFile("db.json", (err, jsonAppointment) => {
        if(!err){
            const oldAppointment = JSON.parse(jsonAppointment);
            penyewaMobil = oldAppointment;
        }
    });
    
    app.on("ready", () => {
        todayWindow = new BrowserWindow({
            webPreferences: {
                nodeIntegration: true
            },
            title: "Aplikasi Rental Mobil"
        });
        todayWindow.loadURL(`file://${__dirname}/today.html`);
        todayWindow.on("closed", () => {

            const jsonAppointment = JSON.stringify(penyewaMobil);
            fs.writeFileSync("db.json", jsonAppointment);

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
        sendTodayAppointments();
        formulirWindow.close();

        console.log(penyewaMobil);
    });

    ipcMain.on("appointment:request:list", event => {
        listWindow.webContents.send('appointment:response:list', penyewaMobil);
    });
    ipcMain.on("appointment:request:today", event => {
        sendTodayAppointments();
        console.log("here2");
    });
    ipcMain.on("appointment:done", (event, id) => {
        penyewaMobil.forEach((appointment) => {
            appointment.done = 1
        })
        sendTodayAppointments()
    });

    const sendTodayAppointments = ()=> {
        const today = new Date().toISOString().slice(0, 10)
        const filtered = penyewaMobil.filter(
            appointment => appointment.date === today 
        );
        todayWindow.webContents.send("appointment:response:today", filtered);
    };

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