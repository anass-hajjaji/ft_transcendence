import { FastifyRequest, FastifyReply } from 'fastify';
import { z, ZodSchema } from 'zod';

export function validate<T extends ZodSchema>(schema: T) {
    return async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            request.body = schema.parse(request.body);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return reply.code(400).send({
                    error: 'Validation failed',
                    details: error.errors.map(e => ({
                        field: e.path.join('.'),
                        message: e.message
                    }))
                });
            }
            console.error('Validation middleware error:', error);
            return reply.code(500).send({ error: 'Internal server error' });
        }
    };
}

export function validateQuery<T extends ZodSchema>(schema: T) {
    return async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            request.query = schema.parse(request.query);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return reply.code(400).send({
                    error: 'Query validation failed',
                    details: error.errors.map(e => ({
                        field: e.path.join('.'),
                        message: e.message
                    }))
                });
            }
            return reply.code(500).send({ error: 'Internal server error' });
        }
    };
}


export function validateParams<T extends ZodSchema>(schema: T) {
    return async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            request.params = schema.parse(request.params);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return reply.code(400).send({
                    error: 'Path parameter validation failed',
                    details: error.errors.map(e => ({
                        field: e.path.join('.'),
                        message: e.message
                    }))
                });
            }
            return reply.code(500).send({ error: 'Internal server error' });
        }
    };
}

export function safeParse<T>(
    schema: ZodSchema<T>,
    data: unknown,
    context: string = 'validation'
): T | null {
    const result = schema.safeParse(data);
    if (!result.success) {
        return null;
    }
    return result.data;
}
