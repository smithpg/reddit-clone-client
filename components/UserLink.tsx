import { User } from '../types/entities';
import Link from 'next/link';

interface UserLinkProps {
  user: User;
}
const UserLink: React.FC<UserLinkProps> = (props) => {
  console.log(props);

  return <Link href={`/user/${props.user._id}`}>{props.user.username}</Link>;
};

export default UserLink;
