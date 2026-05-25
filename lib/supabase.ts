import { createServerClient, type SetAllCookies } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

function assertSupabaseConfig() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables.");
  }
}

type Cookie = {
  name: string;
  value: string;
};

type ServerCookieOptions = {
  getAll: () => Cookie[];
  setAll?: SetAllCookies;
};

export function createSupabaseServerClient({ getAll, setAll }: ServerCookieOptions) {
  assertSupabaseConfig();

  return createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll,
      setAll:
        setAll ??
        (async () => {
          // Pages and components can omit cookie writes when middleware handles refresh.
        }),
    },
  });
}