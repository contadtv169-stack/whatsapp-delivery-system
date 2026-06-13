import fs from "fs"
import path from "path"
import yaml from "js-yaml"
import type { Config } from "@/types"

const CONFIG_PATH = path.join(process.cwd(), "server.yml")

let cachedConfig: Config | null = null

function applyEnvOverrides(config: Config): Config {
  const env = process.env
  return {
    ...config,
    groq: { ...config.groq, api_key: env.GROQ_API_KEY || config.groq.api_key },
    elevenlabs: { ...config.elevenlabs, api_key: env.ELEVENLABS_API_KEY || config.elevenlabs.api_key },
    pagamento: {
      ...config.pagamento,
      kryptpay: {
        ...config.pagamento.kryptpay,
        ci: env.KRYPTPAY_CI || config.pagamento.kryptpay.ci,
        cs: env.KRYPTPAY_CS || config.pagamento.kryptpay.cs,
      },
    },
    admin: { ...config.admin, senha: env.ADMIN_SENHA || config.admin.senha },
  }
}

export function loadConfig(): Config {
  if (cachedConfig) return cachedConfig

  const raw = fs.readFileSync(CONFIG_PATH, "utf-8")
  const parsed = yaml.load(raw) as Config
  cachedConfig = applyEnvOverrides(parsed)
  return cachedConfig
}

export function getConfig(): Config {
  return loadConfig()
}

export function saveConfig(data: Partial<Config>): void {
  const current = loadConfig()
  const merged = { ...current, ...data }
  const yamlStr = yaml.dump(merged, { indent: 2 })
  fs.writeFileSync(CONFIG_PATH, yamlStr, "utf-8")
  cachedConfig = merged
}

export function formatPrompt(template: string, vars: Record<string, string>): string {
  let result = template
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, "g"), value)
  }
  return result
}
