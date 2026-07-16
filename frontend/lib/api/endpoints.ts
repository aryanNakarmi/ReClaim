export const API = {
    AUTH: {
        LOGIN: '/api/v1/auth/login',
        REGISTER: '/api/v1/auth/register',
        UPDATEPROFILE: '/api/v1/auth/update-profile',
        REQUEST_PASSWORD_RESET: '/api/v1/auth/request-password-reset',
        RESET_PASSWORD: (token: string) => `/api/v1/auth/reset-password/${token}`

    },
    ADMIN: {
        USERS: '/api/v1/admin/users',
        USER_BY_ID: (id: string) => `/api/v1/admin/users/${id}`,
    },
    LOST_REPORTS: {
        CREATE: '/api/v1/lost-reports',
        MY_REPORTS: '/api/v1/lost-reports/my-reports',
        ALL_REPORTS: '/api/v1/lost-reports/all',
        REPORT_BY_ID: (id: string) => `/api/v1/lost-reports/${id}`,
        DELETE_REPORT: (id: string) => `/api/v1/lost-reports/${id}`,
        UPDATE_STATUS: (id: string) => `/api/v1/lost-reports/${id}/status`,
        BY_CATEGORY: (category: string) => `/api/v1/lost-reports/category/${category}`,
        UPLOAD_IMAGE: '/api/v1/lost-reports/upload-photo',
    },
    FOUND_ITEMS: {
        GET_ALL: '/api/v1/found-items',
        GET_BY_ID: (id: string) => `/api/v1/found-items/${id}`,
        CREATE: '/api/v1/found-items',
        UPDATE: (id: string) => `/api/v1/found-items/${id}`,
        DELETE: (id: string) => `/api/v1/found-items/${id}`,
        UPDATE_STATUS: (id: string) => `/api/v1/found-items/${id}/status`,
        BY_CATEGORY: (category: string) => `/api/v1/found-items/category/${category}`,
        REQUEST_CLAIM: (id: string) => `/api/v1/found-items/${id}/request-claim`,
        CANCEL_CLAIM: (id: string) => `/api/v1/found-items/${id}/request-claim`,
        CLAIM_REQUESTS: (id: string) => `/api/v1/found-items/${id}/claim-requests`,
    },
    CHAT: {
        GET_ALL: '/api/v1/chats',
        GET_MESSAGES: (chatId: string) => `/api/v1/chats/${chatId}/messages`,
        SEND_ADMIN_MESSAGE: (chatId: string) => `/api/v1/chats/${chatId}/messages`,
        MARK_READ: (chatId: string) => `/api/v1/chats/${chatId}/read`,
        MY_CHAT: '/api/v1/chats/my-chat',
        SEND_USER_MESSAGE: '/api/v1/chats/my-chat/messages',
    }
}