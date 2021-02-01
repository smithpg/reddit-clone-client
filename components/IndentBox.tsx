import { css } from '@emotion/core';

interface IndentBoxProps {
  level: number;
  borderColor: string;
}

const IndentBox: React.FC<IndentBoxProps> = (props) => (
  <div
    css={css`
      margin-left: ${props.level}rem;
      border-left: 1px solid ${props.borderColor};
    `}
  >
    {props.children}
  </div>
);

export default IndentBox;
