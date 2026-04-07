import mongoose from 'mongoose';

const storySchema = new mongoose.Schema({
    user: {
        type: {type: String, required: true, ref: 'User'},    
    },
    content: {
        type: String,
    },
    media_url: [{
        type: String
    }],
    media_type: {
        type: String,
        enum: ['text', 'image', 'vedio']
    },
    views_count: [
        {
            type: String,
            ref: 'User'
        }
    ],
    background_color: {
        type: String,
    }
}, {
    timestamps: true,
    minimize: false
});

const Story = mongoose.model('Story', storySchema);
export default Story;