'use strict'

const { NotFoundError } = require('../cores/error.response');
const Comment = require('../models/comment.model');
const { findProductDetails } = require('../models/repositories/product.repo');
const { convertToObjectIdMongoDb } = require('../utils');

/*
    Comment Service
    1. Add Comment [USER | SHOP]
    2. Get list of comments [USER | SHOP]
    3. Delete a comment [USER | SHOP | ADMIN]
*/
class CommentService {
    static async createComment({
        productId, userId, content, parentCommentId = null
    }) {
        const comment = new Comment({
            comment_productId: productId,
            comment_userId: userId,
            comment_content: content,
            comment_parentId: parentCommentId
        });

        let rightValue;
        if (parentCommentId) {
            // reply comment
            const parentComment = await Comment.findById(parentCommentId);
            if (!parentComment) throw new NotFoundError('CommentParent not found');
            
            rightValue = parentComment.comment_right;

            // update many
            await Comment.updateMany({
                comment_productId: convertToObjectIdMongoDb(productId),
                comment_right: { $gte: rightValue }
            }, {
                $inc: { comment_right: 2 }
            });

            await Comment.updateMany({
                comment_productId: convertToObjectIdMongoDb(productId),
                comment_left: { $gt: rightValue }
            }, {
                $inc: { comment_left: 2 }
            });
        } else {
            const maxRightValue = await Comment.findOne({
                comment_productId: convertToObjectIdMongoDb(productId),
            }, 'comment_right', {
                sort: { comment_right: -1 }
            });
            if (maxRightValue) {
                rightValue = maxRightValue.right + 1;
            } else {
                rightValue = 1
            }
        }

        // insert to model
        comment.comment_left = rightValue;
        comment.comment_right = rightValue + 1;

        await comment.save();
        return comment;
    }

    static async getCommentsByParentId({
        productId,
        parentCommentId = null,
        limit = 50,
        offset = 0
    }) {
        if (parentCommentId) {
            const parentComment = await Comment.findById(parentCommentId);
            if (!parentComment) throw new NotFoundError('CommentParent not found');

            const comments = await Comment.find({
                comment_productId: convertToObjectIdMongoDb(productId),
                comment_left: { $gt: parentComment.comment_left },
                comment_right: { $lte: parentComment.comment_right }
            })
            .select({
                comment_left: 1,
                comment_right: 1,
                comment_content: 1,
                comment_parentId: 1
            })
            .sort({
                comment_left: 1
            });

            return comments;
        }

        const comments = await Comment.find({
            comment_productId: convertToObjectIdMongoDb(productId),
            comment_parentId: parentCommentId
        })
        .select({
            comment_left: 1,
            comment_right: 1,
            comment_content: 1,
            comment_parentId: 1
        })
        .sort({
            comment_left: 1
        });

        return comments;
    }

    static async deleteComment({
        productId, commentId
    }) {
        const foundProduct = await findProductDetails({ product_id: productId });
        if (!foundProduct) throw new NotFoundError('Product Not Found');

        // 1. xác định giá trị left và right of commentId
        const comment = await Comment.findById(commentId);
        if (!comment) throw new NotFoundError('Comment Not Found');

        const leftValue = comment.comment_left;
        const rightValue = comment.comment_right;

        // 2. tính width
        const width = rightValue - leftValue + 1; // viền

        // 3. xóa tất cả commentId con
        await Comment.deleteMany({
            comment_productId: convertToObjectIdMongoDb(productId),
            comment_left: { $gte: leftValue, $lte: rightValue } 
        });

        // 4. cập nhật giá trị left, right còn lại
        await Comment.updateMany({
            comment_productId: convertToObjectIdMongoDb(productId),
            comment_right: { $gt: rightValue }
        }, {
            $inc: { comment_right: -width }
        });

        await Comment.updateMany({
            comment_productId: convertToObjectIdMongoDb(productId),
            comment_left: { $gt: rightValue }
        }, {
            $inc: { comment_left: -width }
        });
    }
}

module.exports = CommentService;