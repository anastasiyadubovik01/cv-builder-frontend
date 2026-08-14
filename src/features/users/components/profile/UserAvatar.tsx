import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type UserAvatarProps = {
  avatar?: string | null;
  firstName: string;
  lastName: string;
};

export function UserAvatar({ avatar, firstName, lastName }: UserAvatarProps) {
  const fullName = `${firstName} ${lastName}`;
  const initial = firstName[0]?.toUpperCase() ?? '';

  return (
    <Avatar className="size-[120px]">
      <AvatarImage src={avatar ?? undefined} alt={fullName} />

      <AvatarFallback
        className="
          bg-[#AEAEAE]
          text-[40px] leading-[40px] font-normal tracking-[0.15px]
          text-[#F5F5F7]
          dark:bg-[#626262]
          dark:text-[#2E2E2E]
        "
      >
        {initial}
      </AvatarFallback>
    </Avatar>
  );
}
