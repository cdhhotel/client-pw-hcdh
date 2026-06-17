import { api } from '../../../services/api';

export const userService = {

    getAll() {
        console.log(api.get(`/auth/all`));
        return api.get(`/auth/all`);
    },

    getById(id) {
        return api.get(`/auth/${id}`);
    },

};
