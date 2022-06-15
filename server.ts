import {serve} from "https://deno.land/std@0.138.0/http/server.ts";
import readTextFile = Deno.readTextFile

const response400 = new Response(null, {status: 400, statusText: 'Bad Request'})

const isSucceed = (response: Response): boolean => {
    return Math.floor(response.status / 100) === 2
}

let tokens: string[] = []

const lineNotifySender = async (temperature: string, humidity: string, header: string): Promise<void> => {
    const formData = new FormData()
    formData.append('message', `温度: ${temperature} 湿度: ${humidity}`)

    const headers: { [key: string]: string } = {}
    headers['Authorization'] = `Bearer ${header}`

    const request = new Request(
        "https://notify-api.line.me/api/notify",
        {
            method: "POST",
            headers: headers,
            body: formData,
        }
    )

    await fetch(request)
}

serve(async (req) => {
    const pathname = new URL(req.url).pathname

    if (pathname === '/' && req.method === 'GET') {
        const file = await readTextFile('./index.html')
        return new Response(file, {headers: {"Content-Type": `text/html, charset=utf8`}})
    }

    const paths = pathname.split("/").filter(path => path !== '')

    if (paths.length === 1 && req.method === 'POST') {
        tokens = tokens.concat([paths[0]])
        return new Response(null)
    }
    if (paths.length === 1 && req.method === 'DELETE') {
        tokens = tokens.filter(token => token !== paths[0])
        return new Response(null)
    }
    if (paths.length !== 2) return response400
    tokens.forEach(token => lineNotifySender(paths[0], paths[1], token))
    return new Response(null)
})