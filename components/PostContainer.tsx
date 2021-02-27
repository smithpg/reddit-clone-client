import { css } from '@emotion/core';
import { useRouter } from 'next/router';

import { Post, User } from '../types/entities';
import VoteButtons from './VoteButtons';
import UserLink from './UserLink';
import Layout from './Layout';

interface PostProps {
  post: Post;
  userVote: number;
  onClickUpVote: (post_id: string) => void;
  onClickDownVote: (post_id: string) => void;
}

const PostContainer: React.FC<PostProps> = ({
  post,
  userVote,
  onClickUpVote,
  onClickDownVote,
}) => {
  const router = useRouter();

  return (
    <div
      css={css`
        margin-bottom: 1rem;
        border: 1px solid #eee;
        border-radius: 5px;
        padding: 12px 18px;
        box-shadow: 1px 1px 10px -5px rgba(0, 0, 0, 0.1);
      `}
    >
      <div
        css={css`
          display: flex;
          justify-content: flex-start;
          align-items: center;
        `}
      >
        <VoteButtons
          onClickUpVote={() => onClickUpVote(post._id)}
          onClickDownVote={() => onClickDownVote(post._id)}
          userVote={userVote}
          value={post.points}
        />
        <div
          css={css`
            padding: 0px 12px;
            display: flex;
            flex-grow: 1;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;

            align-items: flex-start;
            h3 {
              cursor: pointer;
            }
            h3:hover {
              text-decoration: underline;
            }
          `}
        >
          <h3 onClick={() => router.push(`/post/${post._id}`)}>{post.title}</h3>
          <div>
            <span
              css={css`
                margin-right: 1rem;
              `}
            >
              <UserLink user={post.user as User} />
            </span>
            <span>{post.commentCount} comments</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostContainer;
