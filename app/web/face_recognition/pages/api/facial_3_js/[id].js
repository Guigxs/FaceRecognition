import fs from 'fs'
import path from 'path'

const json_filePath = path.resolve('.', 'facial_3_js/model.json')
const json_imageBuffer = fs.readFileSync(json_filePath)

const bin_filePath = path.resolve('.', 'facial_3_js/group1-shard1of1.bin')
const bin_imageBuffer = fs.readFileSync(json_filePath)

export default function handler(req, res) {
    const { id } = req.query
    if (id=="model.json"){
        res.setHeader('Content-Type', 'application/json')
        res.send(json_imageBuffer)
    }
    if (id=="group1-shard1of1.bin"){
        res.setHeader('Content-Disposition', 'attachment')
        res.send(json_imageBuffer)
    }
  }
  