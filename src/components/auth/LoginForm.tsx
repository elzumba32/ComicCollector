'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

interface LoginForm {
  email: string
  password: string
}

export function LoginForm() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>()

  const onSubmit = async (data: LoginForm) => {
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-center text-gray-900">
            Comic Collector
          </h1>
          <h2 className="mt-2 text-center text-gray-600">
            Iniciá sesión en tu colección
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <Input
            label="Email"
            type="email"
            id="email"
            placeholder="tu@email.com"
            error={errors.email?.message}
            {...register('email', { required: 'El email es requerido' })}
          />

          <Input
            label="Contraseña"
            type="password"
            id="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password', { required: 'La contraseña es requerida' })}
          />

          <Button type="submit" loading={loading} className="w-full">
            Iniciar Sesión
          </Button>

          <p className="text-center text-sm text-gray-600">
            ¿No tenés cuenta?{' '}
            <Link href="/register" className="text-blue-600 hover:underline">
              Registrate
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
