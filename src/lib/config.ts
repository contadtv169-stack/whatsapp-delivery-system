import fs from "fs"
import path from "path"
import yaml from "js-yaml"
import type { Config } from "@/types"

const CONFIG_PATH = path.join(process.cwd(), "server.yml")

let cachedConfig: Config | null = null

export function loadConfig(): Config {
  if (cachedConfig) return cachedConfig

  const raw = fs.readFileSync(CONFIG_PATH, "utf-8")
  const parsed = yaml.load(raw) as Config
  cachedConfig = parsed
  return parsed
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
