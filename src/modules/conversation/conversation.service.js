import Conversation from "./conversation.model.js";
import Message from "../message/message.model.js";

export const createConversationIfNeeded =
    async (
        conversationId,
        userId,
        firstMessage
    ) => {

        if (conversationId) {

            const conversation =
                await Conversation.findById(
                    conversationId
                );

            return {
                conversation,
                isNew: false,
            };
        }

        const conversation =
            await Conversation.create({
                userId,
                title:
                    "New Chat",
            });

        return {
            conversation,
            isNew: true,
        };
    };

export const getUserConversations =
    async (userId) => {

        return Conversation
            .find({
                userId,
            })
            .sort({
                updatedAt: -1,
            });
    };

export const getConversationMessages =
    async (
        conversationId,
        userId
    ) => {

        const conversation =
            await Conversation.findOne({
                _id: conversationId,
                userId,
            });

        if (!conversation) {
            throw new Error(
                "Conversation not found"
            );
        }

        return Message
            .find({
                conversationId,
            })
            .sort({
                createdAt: 1,
            });
    };
export const renameConversation = async (
    conversationId,
    userId,
    title
) => {

    const conversation =
        await Conversation.findOneAndUpdate(
            {
                _id: conversationId,
                userId,
            },
            {
                title,
            },
            {
                returnDocument: 'after',
            }
        );

    if (!conversation) {
        throw new Error(
            "Conversation not found"
        );
    }

    return conversation;
};
export const deleteConversation = async (
    conversationId,
    userId
) => {

    const conversation =
        await Conversation.findOne({
            _id: conversationId,
            userId,
        });

    if (!conversation) {
        throw new Error(
            "Conversation not found"
        );
    }

    await Message.deleteMany({
        conversationId,
    });

    await conversation.deleteOne();

};