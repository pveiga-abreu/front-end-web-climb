const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const db = require('../models/user_dao');

exports.login = async (req, res) => {
    try {
        const response = await db.login(req.body.email);

        if (response !== null) {
            const { user_id, name, password, profile } = response;

            bcrypt.compare(req.body.password, password, (err, result) => {
                if (result) {
                    const token = jwt.sign({
                        id: user_id, 
                        name, 
                        profile
                    },
                        process.env.JWD_KEY,
                        {
                            expiresIn: "1h"
                        }
                    );
                    return res.json({ message: "Autenticado com sucesso", token: token});
                }
                return res.status(401).json({ message: "Senha incorreta!" });
            })
        } else {
            return res.status(401).json({ message: "Usuário não cadastrado!" });
        }

    } catch (error) {
        return res.status(500).json({ message: "Falha na autenticação" });
    }
}


exports.register_user =  async (req, res) => {
    let data = req.body;

    bcrypt.hash(data.password, 10, async (errBcrypt, hash) => {
        if (errBcrypt) {
            return res.status(500).json({ error: errBcrypt })
        }

        try {
            data.password = hash;
            const response = await db.register_user(data);

            if (response !== null) {
                return res.status(201).json({
                    message: "Usuário inserido com sucesso",
                    createdUser: {
                        user_id: response.user_id,
                        email: response.email
                    }
                });
            } else {
                return res.status(500).json({ message: "Erro ao inserir no banco" });
            }

        } catch (error) {
            return res.status(500).json({ message: "Erro ao inserir no banco" }, error);
        }
    });
}


exports.alter_user = async (req, res) => {
    let data = req.body;

    if(!Object.keys(data).includes('password')) {
        try {
            const resp = await db.alter_user(data, req.params.id);

            if (resp) {
                return res.status(201).json({
                    message: "Usuário atualizado com sucesso",
                    updatedData: data
                });
            } else {
                return res.status(500).json({message: "Erro ao atualizar!"});
            }

        } catch (error) {
            return res.status(500).json({message: "Erro ao atualizar!"});
        }

    } else {
        bcrypt.hash(data.password, 10, async (errBcrypt, hash) => {
            if (errBcrypt) {
                return res.status(500).json({ error: errBcrypt })
            }
    
            try {
                data.password = hash;
                const resp = await db.alter_user(data, req.params.id);

                if (resp) {
                    return res.status(201).json({
                        message: "Usuário atualizado com sucesso",
                        updatedData: data
                    });
                } else {
                    return res.status(500).json({message: "Erro ao atualizar!"});
                }

            } catch (error) {
                return res.status(500).json({ message:"Erro ao atualizar!"});
            }
    
        });
    }
}


exports.delete_user = async (req, res) => {
    try {
        const resp = await db.delete_user(req.params.id);

        if (resp) {
            return res.json({message : "Usuário deletado com sucesso"});
        } else {
            return res.status(500).json({ message: "Erro ao deletar Usuário" });
        }

    }
    catch (error) {
        return res.status(500).json({ message: "Erro ao deletar Usuário" });
    }
}