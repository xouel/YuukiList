/**
 * YuukiList — Serviço de Healthcheck (Serverless & PostgreSQL)
 */

export interface HealthCheckClient {
  $queryRaw: (query: TemplateStringsArray, ...values: unknown[]) => Promise<unknown>;
}

export interface HealthEvaluationResult {
  httpStatus: 200 | 503;
  body: {
    status: 'ok' | 'degraded';
    database: 'connected' | 'memory' | 'error';
    timestamp: string;
    message?: string;
  };
}

/**
 * Avalia a saúde da aplicação e do PostgreSQL sem expor connection strings ou segredos.
 */
export async function evaluateHealthStatus(
  prismaClient: HealthCheckClient | null | undefined
): Promise<HealthEvaluationResult> {
  const timestamp = new Date().toISOString();
  const hasDbConfig = Boolean(process.env.DATABASE_URL || process.env.DIRECT_URL);

  if (!prismaClient) {
    if (hasDbConfig) {
      return {
        httpStatus: 503,
        body: {
          status: 'degraded',
          database: 'error',
          message: 'Database connectivity check failed',
          timestamp,
        },
      };
    }

    return {
      httpStatus: 200,
      body: {
        status: 'ok',
        database: 'memory',
        timestamp,
      },
    };
  }

  try {
    await prismaClient.$queryRaw`SELECT 1`;
    return {
      httpStatus: 200,
      body: {
        status: 'ok',
        database: 'connected',
        timestamp,
      },
    };
  } catch {
    return {
      httpStatus: 503,
      body: {
        status: 'degraded',
        database: 'error',
        message: 'Database connectivity check failed',
        timestamp,
      },
    };
  }
}

