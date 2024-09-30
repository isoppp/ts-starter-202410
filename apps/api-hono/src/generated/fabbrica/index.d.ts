import type { Example } from "@prisma/client";
import type { User } from "@prisma/client";
import type { Session } from "@prisma/client";
import type { Verification } from "@prisma/client";
import type { VerificationType } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import type { Resolver } from "@quramy/prisma-fabbrica/lib/internal";
export { resetSequence, registerScalarFieldValueGenerator, resetScalarFieldValueGenerator } from "@quramy/prisma-fabbrica/lib/internal";
type BuildDataOptions<TTransients extends Record<string, unknown>> = {
    readonly seq: number;
} & TTransients;
type TraitName = string | symbol;
type CallbackDefineOptions<TCreated, TCreateInput, TTransients extends Record<string, unknown>> = {
    onAfterBuild?: (createInput: TCreateInput, transientFields: TTransients) => void | PromiseLike<void>;
    onBeforeCreate?: (createInput: TCreateInput, transientFields: TTransients) => void | PromiseLike<void>;
    onAfterCreate?: (created: TCreated, transientFields: TTransients) => void | PromiseLike<void>;
};
export declare const initialize: (options: import("@quramy/prisma-fabbrica/lib/internal").InitializeOptions) => void;
type ExampleFactoryDefineInput = {
    id?: string;
    name?: string;
};
type ExampleTransientFields = Record<string, unknown> & Partial<Record<keyof ExampleFactoryDefineInput, never>>;
type ExampleFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<ExampleFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<Example, Prisma.ExampleCreateInput, TTransients>;
type ExampleFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData?: Resolver<ExampleFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: TraitName]: ExampleFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<Example, Prisma.ExampleCreateInput, TTransients>;
type ExampleTraitKeys<TOptions extends ExampleFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;
export interface ExampleFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "Example";
    build(inputData?: Partial<Prisma.ExampleCreateInput & TTransients>): PromiseLike<Prisma.ExampleCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.ExampleCreateInput & TTransients>): PromiseLike<Prisma.ExampleCreateInput>;
    buildList(list: readonly Partial<Prisma.ExampleCreateInput & TTransients>[]): PromiseLike<Prisma.ExampleCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.ExampleCreateInput & TTransients>): PromiseLike<Prisma.ExampleCreateInput[]>;
    pickForConnect(inputData: Example): Pick<Example, "id">;
    create(inputData?: Partial<Prisma.ExampleCreateInput & TTransients>): PromiseLike<Example>;
    createList(list: readonly Partial<Prisma.ExampleCreateInput & TTransients>[]): PromiseLike<Example[]>;
    createList(count: number, item?: Partial<Prisma.ExampleCreateInput & TTransients>): PromiseLike<Example[]>;
    createForConnect(inputData?: Partial<Prisma.ExampleCreateInput & TTransients>): PromiseLike<Pick<Example, "id">>;
}
export interface ExampleFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends ExampleFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): ExampleFactoryInterfaceWithoutTraits<TTransients>;
}
interface ExampleFactoryBuilder {
    <TOptions extends ExampleFactoryDefineOptions>(options?: TOptions): ExampleFactoryInterface<{}, ExampleTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends ExampleTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends ExampleFactoryDefineOptions<TTransients>>(options?: TOptions) => ExampleFactoryInterface<TTransients, ExampleTraitKeys<TOptions>>;
}
/**
 * Define factory for {@link Example} model.
 *
 * @param options
 * @returns factory {@link ExampleFactoryInterface}
 */
export declare const defineExampleFactory: ExampleFactoryBuilder;
type UserFactoryDefineInput = {
    id?: string;
    email?: string;
    createdAt?: Date;
    updatedAt?: Date;
    sessions?: Prisma.SessionCreateNestedManyWithoutUserInput;
};
type UserTransientFields = Record<string, unknown> & Partial<Record<keyof UserFactoryDefineInput, never>>;
type UserFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<UserFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<User, Prisma.UserCreateInput, TTransients>;
type UserFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData?: Resolver<UserFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: TraitName]: UserFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<User, Prisma.UserCreateInput, TTransients>;
type UserTraitKeys<TOptions extends UserFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;
export interface UserFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "User";
    build(inputData?: Partial<Prisma.UserCreateInput & TTransients>): PromiseLike<Prisma.UserCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.UserCreateInput & TTransients>): PromiseLike<Prisma.UserCreateInput>;
    buildList(list: readonly Partial<Prisma.UserCreateInput & TTransients>[]): PromiseLike<Prisma.UserCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.UserCreateInput & TTransients>): PromiseLike<Prisma.UserCreateInput[]>;
    pickForConnect(inputData: User): Pick<User, "id">;
    create(inputData?: Partial<Prisma.UserCreateInput & TTransients>): PromiseLike<User>;
    createList(list: readonly Partial<Prisma.UserCreateInput & TTransients>[]): PromiseLike<User[]>;
    createList(count: number, item?: Partial<Prisma.UserCreateInput & TTransients>): PromiseLike<User[]>;
    createForConnect(inputData?: Partial<Prisma.UserCreateInput & TTransients>): PromiseLike<Pick<User, "id">>;
}
export interface UserFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends UserFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): UserFactoryInterfaceWithoutTraits<TTransients>;
}
interface UserFactoryBuilder {
    <TOptions extends UserFactoryDefineOptions>(options?: TOptions): UserFactoryInterface<{}, UserTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends UserTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends UserFactoryDefineOptions<TTransients>>(options?: TOptions) => UserFactoryInterface<TTransients, UserTraitKeys<TOptions>>;
}
/**
 * Define factory for {@link User} model.
 *
 * @param options
 * @returns factory {@link UserFactoryInterface}
 */
export declare const defineUserFactory: UserFactoryBuilder;
type SessionuserFactory = {
    _factoryFor: "User";
    build: () => PromiseLike<Prisma.UserCreateNestedOneWithoutSessionsInput["create"]>;
};
type SessionFactoryDefineInput = {
    id?: string;
    expiresAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
    user: SessionuserFactory | Prisma.UserCreateNestedOneWithoutSessionsInput;
};
type SessionTransientFields = Record<string, unknown> & Partial<Record<keyof SessionFactoryDefineInput, never>>;
type SessionFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<SessionFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<Session, Prisma.SessionCreateInput, TTransients>;
type SessionFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData: Resolver<SessionFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: string | symbol]: SessionFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<Session, Prisma.SessionCreateInput, TTransients>;
type SessionTraitKeys<TOptions extends SessionFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;
export interface SessionFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "Session";
    build(inputData?: Partial<Prisma.SessionCreateInput & TTransients>): PromiseLike<Prisma.SessionCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.SessionCreateInput & TTransients>): PromiseLike<Prisma.SessionCreateInput>;
    buildList(list: readonly Partial<Prisma.SessionCreateInput & TTransients>[]): PromiseLike<Prisma.SessionCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.SessionCreateInput & TTransients>): PromiseLike<Prisma.SessionCreateInput[]>;
    pickForConnect(inputData: Session): Pick<Session, "id">;
    create(inputData?: Partial<Prisma.SessionCreateInput & TTransients>): PromiseLike<Session>;
    createList(list: readonly Partial<Prisma.SessionCreateInput & TTransients>[]): PromiseLike<Session[]>;
    createList(count: number, item?: Partial<Prisma.SessionCreateInput & TTransients>): PromiseLike<Session[]>;
    createForConnect(inputData?: Partial<Prisma.SessionCreateInput & TTransients>): PromiseLike<Pick<Session, "id">>;
}
export interface SessionFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends SessionFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): SessionFactoryInterfaceWithoutTraits<TTransients>;
}
interface SessionFactoryBuilder {
    <TOptions extends SessionFactoryDefineOptions>(options: TOptions): SessionFactoryInterface<{}, SessionTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends SessionTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends SessionFactoryDefineOptions<TTransients>>(options: TOptions) => SessionFactoryInterface<TTransients, SessionTraitKeys<TOptions>>;
}
/**
 * Define factory for {@link Session} model.
 *
 * @param options
 * @returns factory {@link SessionFactoryInterface}
 */
export declare const defineSessionFactory: SessionFactoryBuilder;
type VerificationFactoryDefineInput = {
    id?: string;
    type?: VerificationType;
    to?: string;
    token?: string;
    expiresAt?: Date;
    usedAt?: Date | null;
    attempt?: number;
    createdAt?: Date;
    updatedAt?: Date;
};
type VerificationTransientFields = Record<string, unknown> & Partial<Record<keyof VerificationFactoryDefineInput, never>>;
type VerificationFactoryTrait<TTransients extends Record<string, unknown>> = {
    data?: Resolver<Partial<VerificationFactoryDefineInput>, BuildDataOptions<TTransients>>;
} & CallbackDefineOptions<Verification, Prisma.VerificationCreateInput, TTransients>;
type VerificationFactoryDefineOptions<TTransients extends Record<string, unknown> = Record<string, unknown>> = {
    defaultData?: Resolver<VerificationFactoryDefineInput, BuildDataOptions<TTransients>>;
    traits?: {
        [traitName: TraitName]: VerificationFactoryTrait<TTransients>;
    };
} & CallbackDefineOptions<Verification, Prisma.VerificationCreateInput, TTransients>;
type VerificationTraitKeys<TOptions extends VerificationFactoryDefineOptions<any>> = Exclude<keyof TOptions["traits"], number>;
export interface VerificationFactoryInterfaceWithoutTraits<TTransients extends Record<string, unknown>> {
    readonly _factoryFor: "Verification";
    build(inputData?: Partial<Prisma.VerificationCreateInput & TTransients>): PromiseLike<Prisma.VerificationCreateInput>;
    buildCreateInput(inputData?: Partial<Prisma.VerificationCreateInput & TTransients>): PromiseLike<Prisma.VerificationCreateInput>;
    buildList(list: readonly Partial<Prisma.VerificationCreateInput & TTransients>[]): PromiseLike<Prisma.VerificationCreateInput[]>;
    buildList(count: number, item?: Partial<Prisma.VerificationCreateInput & TTransients>): PromiseLike<Prisma.VerificationCreateInput[]>;
    pickForConnect(inputData: Verification): Pick<Verification, "id">;
    create(inputData?: Partial<Prisma.VerificationCreateInput & TTransients>): PromiseLike<Verification>;
    createList(list: readonly Partial<Prisma.VerificationCreateInput & TTransients>[]): PromiseLike<Verification[]>;
    createList(count: number, item?: Partial<Prisma.VerificationCreateInput & TTransients>): PromiseLike<Verification[]>;
    createForConnect(inputData?: Partial<Prisma.VerificationCreateInput & TTransients>): PromiseLike<Pick<Verification, "id">>;
}
export interface VerificationFactoryInterface<TTransients extends Record<string, unknown> = Record<string, unknown>, TTraitName extends TraitName = TraitName> extends VerificationFactoryInterfaceWithoutTraits<TTransients> {
    use(name: TTraitName, ...names: readonly TTraitName[]): VerificationFactoryInterfaceWithoutTraits<TTransients>;
}
interface VerificationFactoryBuilder {
    <TOptions extends VerificationFactoryDefineOptions>(options?: TOptions): VerificationFactoryInterface<{}, VerificationTraitKeys<TOptions>>;
    withTransientFields: <TTransients extends VerificationTransientFields>(defaultTransientFieldValues: TTransients) => <TOptions extends VerificationFactoryDefineOptions<TTransients>>(options?: TOptions) => VerificationFactoryInterface<TTransients, VerificationTraitKeys<TOptions>>;
}
/**
 * Define factory for {@link Verification} model.
 *
 * @param options
 * @returns factory {@link VerificationFactoryInterface}
 */
export declare const defineVerificationFactory: VerificationFactoryBuilder;
