"use server"

import { cookies } from "next/headers"

interface UserData {
    _id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    updatedAt: string; 
    [key: string]: any;
}

// Auth token cookie — NOT httpOnly so client-side JS can read it for API headers
const AUTH_COOKIE_OPTIONS = {
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 30 * 24 * 60 * 60, // 30 days
};

// User data cookie — httpOnly since it's only read server-side via getAuthToken()/getUserData()
const USER_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 30 * 24 * 60 * 60,
};

export const setAuthToken = async (token: string) => {
    const cookieStore = await cookies();
    cookieStore.set({
        name: 'auth_token',
        value: token,
        ...AUTH_COOKIE_OPTIONS,
    })
}
export const getAuthToken = async () => {
    const cookieStore = await cookies();
    return cookieStore.get('auth_token')?.value || null;
}
export const setUserData = async (userData: UserData) => {
    const cookieStore = await cookies();
    cookieStore.set({
        name: 'user_data',
        value: JSON.stringify(userData),
        ...USER_COOKIE_OPTIONS,
    })
}
export const getUserData = async (): Promise<UserData | null> => {
    const cookieStore = await cookies();
    const userData = cookieStore.get('user_data')?.value || null;
    return userData ? JSON.parse(userData) : null;
}

export const clearAuthCookies = async () => {
    const cookieStore = await cookies();
    cookieStore.delete('auth_token');
    cookieStore.delete('user_data');
}