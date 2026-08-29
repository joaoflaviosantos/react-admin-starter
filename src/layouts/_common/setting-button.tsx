import { useState } from 'react';
import { flushSync } from 'react-dom';
import { useTranslation } from 'react-i18next';

import { IconButton, SvgIcon } from '@/components/icon';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { useSettingActions, useSettings } from '@/store/settingStore';
import {
  colorPrimarys,
  resolveThemePrimaryColor,
  themeColorPresetOrder,
} from '@/theme/color-presets';
import { normalizeHexColor } from '@/theme/color-utils';
import { cn } from '@/lib/utils';

import { ThemeColorPresets, ThemeLayout, ThemeMode } from '#/enum';

function ThemeColorOption({
  preset,
  customColor,
  variant = 'option',
}: {
  preset: ThemeColorPresets;
  customColor?: string;
  variant?: 'option' | 'value';
}) {
  const { t } = useTranslation();
  const isCustomPreset = preset === ThemeColorPresets.Custom;
  const swatchColor = resolveThemePrimaryColor(
    preset,
    customColor ?? colorPrimarys[ThemeColorPresets.Custom],
  );
  const showCustomGradient = isCustomPreset && variant === 'option';

  return (
    <div className="flex min-w-0 items-center gap-2">
      <span
        aria-hidden
        className={cn(
          'inline-block h-3.5 w-3.5 shrink-0 rounded-full border border-border/60',
          showCustomGradient &&
            'bg-[conic-gradient(from_180deg,red,yellow,lime,cyan,blue,magenta,red)]',
        )}
        style={showCustomGradient ? undefined : { backgroundColor: swatchColor }}
      />
      <span className="truncate">{t(`common.themeColors.${preset}`)}</span>
    </div>
  );
}

export default function SettingButton() {
  const { t } = useTranslation();
  const [sheetOpen, setSheetOpen] = useState(false);
  const settings = useSettings();
  const {
    themeMode,
    themeColorPresets,
    themeCustomColor,
    themeLayout,
    themeStretch,
    breadCrumb,
    multiTab,
  } = settings;
  const { setSettings, resetSettings } = useSettingActions();

  const setThemeMode = (nextMode: ThemeMode) => {
    const apply = () => setSettings({ ...settings, themeMode: nextMode });
    if (!document.startViewTransition) {
      apply();
    } else {
      document.startViewTransition(() => {
        flushSync(apply);
      });
    }
  };

  const updateCustomColor = (value: string) => {
    setSettings({
      ...settings,
      themeCustomColor: normalizeHexColor(value, themeCustomColor),
    });
  };

  const handleResetSettings = () => {
    const apply = () => resetSettings();
    if (!document.startViewTransition) {
      apply();
      return;
    }

    document.startViewTransition(() => {
      flushSync(apply);
    });
  };

  const layoutBackground = (layout: ThemeLayout) =>
    themeLayout === layout
      ? 'linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--primary)) 100%)'
      : '#919eab';

  const settingCardHeaderClass = 'px-4 py-3';
  const settingCardContentClass = 'px-4 pb-4 pt-3';

  return (
    <>
      <IconButton
        title={t('common.uiAdjusts')}
        className="h-10 w-10"
        onClick={() => setSheetOpen(true)}
      >
        <SvgIcon icon="ic-setting" size="22" />
      </IconButton>
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-[280px]">
          <SheetHeader>
            <SheetTitle>{t('common.uiAdjusts')}</SheetTitle>
          </SheetHeader>
          <SheetBody className="flex flex-col gap-4">
            <Card>
              <CardHeader className={settingCardHeaderClass}>
                <CardTitle className="text-sm">{t('common.darkMode')}</CardTitle>
              </CardHeader>
              <CardContent className={settingCardContentClass}>
                <Switch
                  checked={themeMode === ThemeMode.Dark}
                  onCheckedChange={(checked) =>
                    setThemeMode(checked ? ThemeMode.Dark : ThemeMode.Light)
                  }
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className={settingCardHeaderClass}>
                <CardTitle className="text-sm">{t('common.color')}</CardTitle>
              </CardHeader>
              <CardContent className={settingCardContentClass}>
                <Select
                  value={themeColorPresets}
                  onValueChange={(value) =>
                    setSettings({
                      ...settings,
                      themeColorPresets: value as ThemeColorPresets,
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <ThemeColorOption
                      preset={themeColorPresets}
                      customColor={themeCustomColor}
                      variant="value"
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {themeColorPresetOrder.map((preset) => (
                      <SelectItem key={preset} value={preset}>
                        <ThemeColorOption preset={preset} customColor={themeCustomColor} />
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {themeColorPresets === ThemeColorPresets.Custom ? (
                  <div className="mt-3 space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">
                      {t('common.customColor')}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={themeCustomColor}
                        onChange={(event) => updateCustomColor(event.target.value)}
                        aria-label={t('common.customColor')}
                        className="h-10 w-14 shrink-0 cursor-pointer rounded-md border border-border bg-transparent p-1"
                      />
                      <Input
                        value={themeCustomColor}
                        onChange={(event) => updateCustomColor(event.target.value)}
                        className="font-mono uppercase"
                        maxLength={7}
                        spellCheck={false}
                      />
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className={settingCardHeaderClass}>
                <CardTitle className="text-sm">{t('common.layout')}</CardTitle>
              </CardHeader>
              <CardContent className={settingCardContentClass}>
                <div className="grid grid-cols-3 gap-1.5">
                  {[ThemeLayout.Vertical, ThemeLayout.Horizontal, ThemeLayout.Mini].map(
                    (layout) => (
                      <Button
                        key={layout}
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-auto min-h-10 min-w-0 whitespace-normal rounded-md px-1 py-2 text-center text-[11px] leading-tight text-white"
                        style={{ background: layoutBackground(layout) }}
                        onClick={() => setSettings({ ...settings, themeLayout: layout })}
                      >
                        {t(`common.${layout}`)}
                      </Button>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className={settingCardHeaderClass}>
                <CardTitle className="text-sm">{t('common.stretch')}</CardTitle>
              </CardHeader>
              <CardContent className={settingCardContentClass}>
                <Switch
                  checked={themeStretch}
                  onCheckedChange={(checked) => setSettings({ ...settings, themeStretch: checked })}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className={settingCardHeaderClass}>
                <CardTitle className="text-sm">{t('common.breadcrumb')}</CardTitle>
              </CardHeader>
              <CardContent className={settingCardContentClass}>
                <Switch
                  checked={breadCrumb}
                  onCheckedChange={(checked) => setSettings({ ...settings, breadCrumb: checked })}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className={settingCardHeaderClass}>
                <CardTitle className="text-sm">{t('common.multiTab')}</CardTitle>
              </CardHeader>
              <CardContent className={settingCardContentClass}>
                <Switch
                  checked={multiTab}
                  onCheckedChange={(checked) => setSettings({ ...settings, multiTab: checked })}
                />
              </CardContent>
            </Card>
          </SheetBody>
          <SheetFooter>
            <Button
              type="button"
              variant="outline"
              className="w-full border-destructive/40 bg-transparent text-destructive shadow-none hover:bg-destructive/10 hover:text-destructive dark:border-destructive/50 dark:text-red-400 dark:hover:bg-destructive/15 dark:hover:text-red-400"
              onClick={handleResetSettings}
            >
              {t('common.resetSettings')}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
