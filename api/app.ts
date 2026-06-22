import express, {
  type Request,
  type Response,
} from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import exhibitRoutes from './routes/exhibits.js'
import institutionRoutes from './routes/institutions.js'
import loanRoutes from './routes/loans.js'
import riskRoutes from './routes/risks.js'
import transportRoutes from './routes/transport.js'

dotenv.config()

const app: express.Application = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

app.use('/api/exhibits', exhibitRoutes)
app.use('/api/institutions', institutionRoutes)
app.use('/api/loans', loanRoutes)
app.use('/api/risks', riskRoutes)
app.use('/api/transport', transportRoutes)

app.get(
  '/api/health',
  (_req: Request, res: Response): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

app.use((error: Error, _req: Request, res: Response, _next) => {
  console.error(error)
  res.status(500).json({
    success: false,
    error: 'Server internal error',
  })
})

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app
