export interface SignInModel {
    phone_number: string;
}

export interface VerifySignInModel {
    code: string;
}

export interface UserResponse {
    sub: string;
    exp: number;
    entity_id: string;
    kind: string;
    role_keys: string[];
    permission_keys: string[];
}

export interface JWT {
    sub: string;
    exp: number;
    entity_id: string;
    kind: string;
    role_keys: string[];
    permission_keys: string[];
}
