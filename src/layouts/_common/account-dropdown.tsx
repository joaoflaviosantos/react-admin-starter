import { useTranslation } from 'react-i18next';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { IconButton } from '@/components/icon';
import { useSignOut, useUserInfo } from '@/store/userStore';
import { getColorFromName } from '@/utils/colors';
import { getInitials } from '@/utils/format-string';

export default function AccountDropdown() {
  const userInfo = useUserInfo();
  const signOut = useSignOut();
  const { t } = useTranslation();
  const displayName = userInfo.name || '';
  const avatarColor = getColorFromName(displayName);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconButton className="h-11 w-11 transform-none px-0">
          <Avatar className="h-8 w-8">
            {userInfo.profile_image_url ? (
              <AvatarImage src={userInfo.profile_image_url} alt={displayName} />
            ) : null}
            <AvatarFallback
              className="text-[0.7rem] font-medium text-white"
              style={{ backgroundColor: avatarColor }}
            >
              {getInitials(displayName, 2)}
            </AvatarFallback>
          </Avatar>
        </IconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="flex flex-col items-start p-4">
          <div className="font-medium">{userInfo.name}</div>
          <div className="text-sm text-muted-foreground">{userInfo.email}</div>
          <div className="text-sm font-semibold opacity-60">
            {userInfo.role_label ?? userInfo.role}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut} className="font-bold text-warning">
          {t('sys.login.logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
