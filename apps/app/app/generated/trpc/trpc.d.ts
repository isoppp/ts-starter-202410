import * as _trpc_server from '@trpc/server';
import * as _trpc_server_unstable_core_do_not_import from '@trpc/server/unstable-core-do-not-import';

declare const appRouter: _trpc_server_unstable_core_do_not_import.BuiltRouter<{
    ctx: {
        req: Request;
        resHeaders: Headers;
        user: {
            id: string;
            email: string;
            createdAt: Date;
            updatedAt: Date;
        };
    } | {
        req: Request;
        resHeaders: Headers;
        user: null;
    };
    meta: object;
    errorShape: {
        data: {
            code: _trpc_server_unstable_core_do_not_import.TRPC_ERROR_CODE_KEY;
            httpStatus: number;
            path?: string;
            stack?: string;
        };
        message: string;
        code: _trpc_server_unstable_core_do_not_import.TRPC_ERROR_CODE_NUMBER;
    };
    transformer: false;
}, _trpc_server_unstable_core_do_not_import.DecorateCreateRouterOptions<{
    example: _trpc_server_unstable_core_do_not_import.BuiltRouter<{
        ctx: {
            req: Request;
            resHeaders: Headers;
            user: {
                id: string;
                email: string;
                createdAt: Date;
                updatedAt: Date;
            };
        } | {
            req: Request;
            resHeaders: Headers;
            user: null;
        };
        meta: object;
        errorShape: {
            data: {
                code: _trpc_server_unstable_core_do_not_import.TRPC_ERROR_CODE_KEY;
                httpStatus: number;
                path?: string;
                stack?: string;
            };
            message: string;
            code: _trpc_server_unstable_core_do_not_import.TRPC_ERROR_CODE_NUMBER;
        };
        transformer: false;
    }, {
        hello: _trpc_server.TRPCQueryProcedure<{
            input: void;
            output: string;
        }>;
        list: _trpc_server.TRPCQueryProcedure<{
            input: void;
            output: {
                id: string;
                name: string;
            }[];
        }>;
        create: _trpc_server.TRPCMutationProcedure<{
            input: {
                name: string;
            };
            output: {
                id: string;
                name: string;
            };
        }>;
    }>;
    auth: _trpc_server_unstable_core_do_not_import.BuiltRouter<{
        ctx: {
            req: Request;
            resHeaders: Headers;
            user: {
                id: string;
                email: string;
                createdAt: Date;
                updatedAt: Date;
            };
        } | {
            req: Request;
            resHeaders: Headers;
            user: null;
        };
        meta: object;
        errorShape: {
            data: {
                code: _trpc_server_unstable_core_do_not_import.TRPC_ERROR_CODE_KEY;
                httpStatus: number;
                path?: string;
                stack?: string;
            };
            message: string;
            code: _trpc_server_unstable_core_do_not_import.TRPC_ERROR_CODE_NUMBER;
        };
        transformer: false;
    }, {
        isSignedIn: _trpc_server.TRPCQueryProcedure<{
            input: void;
            output: {
                isSignedIn: boolean;
            };
        }>;
        signupWithEmail: _trpc_server.TRPCMutationProcedure<{
            input: {
                email: string;
            };
            output: {
                ok: true;
            };
        }>;
        signInWithEmail: _trpc_server.TRPCMutationProcedure<{
            input: {
                email: string;
            };
            output: {
                ok: boolean;
            };
        }>;
        signInVerification: _trpc_server.TRPCMutationProcedure<{
            input: {
                token: string;
            };
            output: {
                ok: true;
            } | {
                ok: false;
                attemptExceeded: boolean;
            };
        }>;
        signUpVerification: _trpc_server.TRPCMutationProcedure<{
            input: {
                token: string;
            };
            output: {
                ok: true;
            } | {
                ok: false;
                attemptExceeded: boolean;
            };
        }>;
    }>;
}>>;

type AppRouter = typeof appRouter;

export type { AppRouter };
