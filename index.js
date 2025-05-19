const express = require("express");
const bodyParser = require("body-parser");
const puppeteer = require("puppeteer")
const path = require("path")
const fs = require("fs")

const app = express();
app.use(bodyParser.json());

// test route
app.get("/", (req, res) => {
    res.send("Hello World");
})

// pdf generation route
app.post("/generate-pdf", async (req, res) => {
    try {
        const data = req.body;

        let html = fs.readFileSync(path.join(__dirname, "template", "index.html"), "utf8")
        // console.log(html)


        Object.keys(data).forEach(key => {
            const reg = new RegExp(`{{${key}}}`, "g")
            html = html.replace(reg, data[key])
        })

        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: "networkidle0" });

        const fileName = `${data.name}_certificate_${Date.now()}.pdf`

        const filePath = path.join(__dirname, "pdfs", fileName)

        await page.pdf({ path: filePath, format: "A4", landscape: true })

        await browser.close();

        res.json({ message: "PDF Generated", filePath: filePath })


    } catch (error) {
        console.error(error.message)
        throw new Error;

    }
})

app.listen(3000, () => {
    console.log("Server is running on port 3000");
})