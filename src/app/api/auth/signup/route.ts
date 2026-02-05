import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { z } from 'zod'
import clientPromise from '@/lib/mongodb'
import { UserModel } from '@/lib/models/user'

const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = signUpSchema.parse(body)

    const client = await clientPromise
    const userModel = new UserModel(client)

    // Check if user already exists
    const existingUser = await userModel.findByEmail(validatedData.email)
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists with this email' }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await hash(validatedData.password, 12)

    // Create user
    const userId = await userModel.create({
      name: validatedData.name,
      email: validatedData.email,
      password: hashedPassword,
    })

    return NextResponse.json(
      {
        message: 'User created successfully',
        userId,
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.issues,
        },
        { status: 400 }
      )
    }

    console.error('Sign up error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
