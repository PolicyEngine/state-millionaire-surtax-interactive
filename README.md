# State Millionaire Surtax Interactive

An interactive calculator for exploring state millionaire surtax proposals. Built by PolicyEngine.

## Features

- **Story Tab**: Scrollytelling narrative explaining millionaire surtaxes across the US
- **Interactive Calculator**: Model custom surtax scenarios with:
  - State selection (NYC, Michigan, Rhode Island, Hawaii)
  - Configurable surtax rate and income thresholds
  - Filing status-specific thresholds
  - Net income impact visualization

## States Covered

| State | Status | Default Rate | Default Threshold |
|-------|--------|--------------|-------------------|
| Massachusetts | Enacted (2023) | 4% | $1M |
| Michigan | Proposed Ballot | 5% | $500K (single) / $1M (joint) |
| NYC | Proposed (Mamdani) | 2% | $1M |
| Rhode Island | Under Consideration | TBD | TBD |
| Hawaii | Under Consideration | TBD | TBD |

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS, Recharts
- **Backend**: FastAPI, PolicyEngine US
- **Deployment**: Vercel (frontend), Modal (backend)

## Local Development

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at http://localhost:3000

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8080
```

The API will be available at http://localhost:8080

### Environment Variables

**Frontend** (`.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

**Backend** (`.env`):
```
FRONTEND_URL=http://localhost:3000
```

## Deployment

### Frontend (Vercel)

1. Connect your repo to Vercel
2. Set root directory to `frontend`
3. Set `NEXT_PUBLIC_API_URL` to your Modal API URL

### Backend (Modal)

```bash
modal deploy modal_app.py
```

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/household-impact` - Calculate household surtax impact
- `POST /api/aggregate-impact` - Calculate statewide aggregate impact

## License

MIT License - See LICENSE file for details.

## Contributing

Contributions welcome! Please open an issue or PR.
