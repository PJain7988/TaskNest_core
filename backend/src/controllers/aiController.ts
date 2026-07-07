import { Request, Response } from 'express'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export const callGemini = async (req: Request, res: Response) => {
  try {
    const { prompt, asJson } = req.body
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' })

    const response = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama3-70b-8192',
      response_format: asJson ? { type: 'json_object' } : { type: 'text' }
    })
    
    return res.status(200).json({ success: true, data: response.choices[0]?.message?.content || '' })
  } catch (error: any) {
    console.error('Groq AI Error:', error)
    return res.status(500).json({ success: false, error: error.message || 'Internal Server Error' })
  }
}
