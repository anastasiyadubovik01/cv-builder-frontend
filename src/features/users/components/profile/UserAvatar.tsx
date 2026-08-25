'use client';

import { type ChangeEvent, useRef } from 'react';
import { useMutation } from '@apollo/client/react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/components/ui/sonner';

import { UPLOAD_AVATAR_MUTATION } from '@/api/profile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { UploadIcon } from '@/components/icons/upload-icon';
import { fileToBase64 } from '@/lib/helpers/file-to-base64';

const MAX_FILE_SIZE = 500_000;

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

type UserAvatarProps = {
  userId: string;
  avatar?: string | null;
  firstName: string;
  lastName: string;
  canEdit: boolean;
  onUpdated: () => Promise<unknown>;
};

export function UserAvatar({
  userId,
  avatar,
  firstName,
  lastName,
  canEdit,
  onUpdated,
}: UserAvatarProps) {
  const { t } = useTranslation();
  const toast = useToast();

  const inputRef = useRef<HTMLInputElement>(null);

  const [uploadAvatar, { loading }] = useMutation(UPLOAD_AVATAR_MUTATION);

  const fullName = `${firstName} ${lastName}`;
  const initial = firstName[0]?.toUpperCase() ?? '';

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error(t('users.details.avatar.invalidType'));

      event.target.value = '';
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error(t('users.details.avatar.tooLarge'));

      event.target.value = '';
      return;
    }

    try {
      const base64 = await fileToBase64(file);

      await uploadAvatar({
        variables: {
          avatar: {
            userId,
            base64,
            size: file.size,
            type: file.type,
          },
        },
      });

      await onUpdated();
      toast.success(t('users.details.avatar.uploadSucces'));
    } catch {
      toast.error(t('users.details.avatar.uploadError'));
    } finally {
      event.target.value = '';
    }
  };

  return (
    <>
      {loading && <LoadingOverlay />}

      <div className="flex items-center gap-12">
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

        {canEdit && (
          <div>
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/gif"
              className="hidden"
              onChange={handleFileChange}
            />

            <button
              type="button"
              disabled={loading}
              onClick={() => inputRef.current?.click()}
              className="cursor-pointer text-left disabled:cursor-not-allowed disabled:opacity-50"
            >
              <div className="flex items-center gap-5">
                <UploadIcon className="size-[35px] shrink-0 text-[#2E2E2E] dark:text-[#F5F5F7]" />

                <p className="text-[18px] leading-7 font-medium tracking-[0.15px] text-[#2E2E2E] dark:text-[#F5F5F7]">
                  {loading
                    ? t('users.details.avatar.uploading')
                    : t('users.details.avatar.upload')}
                </p>
              </div>

              <p className="mt-1 text-[16px] leading-7 font-normal tracking-[0.15px] text-[#2E2E2E]/60 dark:text-[#F5F5F7]/60">
                {t('users.details.avatar.hint')}
              </p>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
