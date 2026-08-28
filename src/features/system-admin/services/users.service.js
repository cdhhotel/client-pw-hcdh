import { api } from '../../../services/api';

export const userService = {

    getAll() {
        return api.get(`/auth/all`);
    },

    getById(id) {
        return api.get(`/auth/${id}`);
    },

};
