type Level = 'info' | 'warn' | 'error'
type Fields = Record<string, string | number | boolean | null>

// Never pass personal data (name, email, company) into fields.
// Keep a stable key set (event, slug, stage, durationMs) so logs stay filterable in Vercel.
function emit(level: Level, event: string, fields: Fields = {}): void {
  // Vercel captures console output as structured JSON; level derives from the console method.
  const line = JSON.stringify({ event, ...fields })
  if (level === 'error') console.error(line)
  else if (level === 'warn') console.warn(line)
  else console.log(line)
}

export const log = {
  info(event: string, fields?: Fields): void {
    emit('info', event, fields)
  },
  warn(event: string, fields?: Fields): void {
    emit('warn', event, fields)
  },
  error(event: string, fields?: Fields): void {
    emit('error', event, fields)
  },
}
