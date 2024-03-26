'use strict'

const { SuccessResponse } = require("../cores/success.response");
const CommentService = require('../services/comment.service');

class CommentController {
    createComment = async (req, res, next) => {
        new SuccessResponse({
            message: 'Success Create Comment',
            metadata: await CommentService.createComment(req.body)
        }).send(res);
    }

    deleteComment = async (req, res, next) => {
        new SuccessResponse({
            message: 'Success Delete Comment',
            metadata: await CommentService.deleteComment(req.body)
        }).send(res);
    }

    getCommentsByParentId = async (req, res, next) => {
        new SuccessResponse({
            message: 'Success Get Comments By ParentId',
            metadata: await CommentService.getCommentsByParentId(req.query)
        }).send(res);
    }
}

module.exports = new CommentController();