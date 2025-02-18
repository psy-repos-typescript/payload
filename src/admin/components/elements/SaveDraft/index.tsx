import React, { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfig } from '../../utilities/Config';
import FormSubmit from '../../forms/Submit';
import { useForm, useFormModified } from '../../forms/Form/context';
import { useDocumentInfo } from '../../utilities/DocumentInfo';
import { useLocale } from '../../utilities/Locale';
import useHotkey from '../../../hooks/useHotkey';
import RenderCustomComponent from '../../utilities/RenderCustomComponent';
import { useEditDepth } from '../../utilities/EditDepth';


const baseClass = 'save-draft';

export type CustomSaveDraftButtonProps = React.ComponentType<DefaultSaveDraftButtonProps & {
  DefaultButton: React.ComponentType<DefaultSaveDraftButtonProps>;
}>
export type DefaultSaveDraftButtonProps = {
  saveDraft: () => void;
  disabled: boolean;
  label: string;
};
const DefaultSaveDraftButton: React.FC<DefaultSaveDraftButtonProps> = ({ disabled, saveDraft, label }) => {
  const ref = useRef<HTMLButtonElement>(null);
  const editDepth = useEditDepth();

  useHotkey({ keyCodes: ['s'], cmdCtrlKey: true, editDepth }, (e) => {
    if (disabled) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    if (ref?.current) {
      ref.current.click();
    }
  });

  return (
    <FormSubmit
      className={baseClass}
      type="button"
      buttonStyle="secondary"
      onClick={saveDraft}
      disabled={disabled}
      ref={ref}
    >
      {label}
    </FormSubmit>
  );
};

type Props = {
  CustomComponent?: CustomSaveDraftButtonProps
}
export const SaveDraft: React.FC<Props> = ({ CustomComponent }) => {
  const { serverURL, routes: { api } } = useConfig();
  const { submit } = useForm();
  const { collection, global, id } = useDocumentInfo();
  const modified = useFormModified();
  const locale = useLocale();
  const { t } = useTranslation('version');

  const canSaveDraft = modified;

  const saveDraft = useCallback(() => {
    const search = `?locale=${locale}&depth=0&fallback-locale=null&draft=true`;
    let action;
    let method = 'POST';

    if (collection) {
      action = `${serverURL}${api}/${collection.slug}${id ? `/${id}` : ''}${search}`;
      if (id) method = 'PATCH';
    }

    if (global) {
      action = `${serverURL}${api}/globals/${global.slug}${search}`;
    }

    submit({
      action,
      method,
      skipValidation: true,
      overrides: {
        _status: 'draft',
      },
    });
  }, [submit, collection, global, serverURL, api, locale, id]);

  return (
    <RenderCustomComponent
      CustomComponent={CustomComponent}
      DefaultComponent={DefaultSaveDraftButton}
      componentProps={{
        saveDraft,
        disabled: !canSaveDraft,
        label: t('saveDraft'),
        DefaultButton: DefaultSaveDraftButton,
      }}
    />
  );
};
