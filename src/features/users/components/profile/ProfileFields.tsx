'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue } from '@/components/ui/select';

type ProfileFieldsProps = {
  firstName: string;
  lastName: string;
  department: string;
  position: string;
  canEdit: boolean;
};

const labelClassName =
  'ml-4 text-[12px] leading-[23px] font-normal tracking-[0.15px] text-[#626262] dark:text-[#AEAEAE]';

export function ProfileFields({
  firstName,
  lastName,
  department,
  position,
  canEdit,
}: ProfileFieldsProps) {
  return (
    <div className="mt-[47px] grid w-full max-w-[664px] grid-cols-1 gap-y-9 lg:w-[852px] lg:max-w-none lg:grid-cols-[410px_410px] lg:gap-x-8">
      <div>
        <Label htmlFor="firstName" className={labelClassName}>
          First Name
        </Label>

        <Input
          id="firstName"
          value={firstName}
          disabled={!canEdit}
          readOnly
          className="h-12 w-full disabled:opacity-100"
        />
      </div>

      <div>
        <Label htmlFor="lastName" className={labelClassName}>
          Last Name
        </Label>

        <Input
          id="lastName"
          value={lastName}
          disabled={!canEdit}
          readOnly
          className="h-12 w-full disabled:opacity-100"
        />
      </div>

      <div>
        <Label htmlFor="department" className={labelClassName}>
          Department
        </Label>

        <Select value={department} disabled={!canEdit}>
          <SelectTrigger
            id="department"
            className="h-12 w-full disabled:opacity-100"
          >
            <SelectValue />
          </SelectTrigger>
        </Select>
      </div>

      <div>
        <Label htmlFor="position" className={labelClassName}>
          Position
        </Label>

        <Select value={position} disabled={!canEdit}>
          <SelectTrigger
            id="position"
            className="h-12 w-full disabled:opacity-100"
          >
            <SelectValue />
          </SelectTrigger>
        </Select>
      </div>
    </div>
  );
}
