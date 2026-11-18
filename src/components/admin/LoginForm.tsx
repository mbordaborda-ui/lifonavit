"use client";

import { useActionState } from "react";
import { Loader2, Lock } from "lucide-react";
import { loginAction, type LoginState } from "@/server/actions/auth";

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(loginAction, {});

  return (
    <form action={formAction} className="mt-7 space-y-4">
      <input type="hidden" name="next" value={next} />
      <div>
        <label className="field-label" htmlFor="email">
          Correo del administrador
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          className="field"
          required
          placeholder="admin@linfovit.co"
        />
      </div>
      <div>
        <label className="field-label" htmlFor="password">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          className="field"
          required
          minLength={6}
        />
      </div>

      {state.error ? (
        <p
          role="alert"
          className="rounded-lg border border-[#c47a6f]/40 bg-[#fdf1ee] px-3 py-2.5 text-[12px] text-[#8f3a2e]"
        >
          {state.error}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className="btn btn-primary w-full">
        {pending ? (
          <>
            <Loader2 size={14} className="animate-spin" /> Ingresando…
          </>
        ) : (
          <>
            <Lock size={14} /> Ingresar al panel
          </>
        )}
      </button>

      <p className="text-center text-[10.5px] leading-relaxed text-ink-soft">
        Acceso restringido. Los intentos fallidos se limitan por seguridad.
      </p>
    </form>
  );
}
