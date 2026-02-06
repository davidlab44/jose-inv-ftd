
export function mapToSession(raw: any): Session {
  return {
    id: raw.id,
    name: raw.name,
    user_id: {
      id: raw.user_id?.[0] ?? 0,
      name: raw.user_id?.[1] ?? ''
    },
    config_id: {
      id: raw.config_id?.[0] ?? 0,
      name: raw.config_id?.[1] ?? ''
    },
    state: raw.state
  };
}

export interface UserRef {
  id: number;
  name: string;
}

export interface ConfigRef {
  id: number;
  name: string;
}

export interface Session {
  id: number;
  name: string;
  user_id: UserRef;
  config_id: ConfigRef;
  state: "opened" | "closed" | "opening_control" | string;
}




// // interfaces/session.ts
// export interface UserRef {
//   id: number;
//   name: string;
// }

// export interface ConfigRef {
//   id: number;
//   name: string;
// }

// export interface Session {
//   id: number;
//   name: string;
//   user_id: UserRef;
//   config_id: ConfigRef;
//   state: "opened" | "closed" | "opening_control" | string;
// }
