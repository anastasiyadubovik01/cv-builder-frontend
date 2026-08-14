type UserInfoProps = {
  firstName: string;
  lastName: string;
  email: string;
  memberSince: string;
};

export function UserInfo({
  firstName,
  lastName,
  email,
  memberSince,
}: UserInfoProps) {
  const fullName = `${firstName} ${lastName}`;

  return (
    <div className="flex flex-col items-center">
      <h1
        className="
          text-[24px] leading-[32px] font-normal
          text-[#2E2E2E]
          dark:text-[#F5F5F7]
        "
      >
        {fullName}
      </h1>

      <p
        className="
          mt-1 text-[16px] leading-6 font-normal tracking-[0.15px]
          text-[#626262]
          dark:text-[#AEAEAE]
        "
      >
        {email}
      </p>

      <p
        className="
          text-[16px] leading-6 font-normal tracking-[0.15px]
          text-[#2E2E2E]
          dark:text-[#F5F5F7]
        "
      >
        A member since {memberSince}
      </p>
    </div>
  );
}
