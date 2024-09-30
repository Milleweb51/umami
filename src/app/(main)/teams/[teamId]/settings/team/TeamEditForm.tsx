import {
  SubmitButton,
  Form,
  FormInput,
  FormRow,
  FormButtons,
  TextField,
  Button,
  Flexbox,
  useToasts,
  Toggle,
} from 'react-basics';
import { getRandomChars } from 'next-basics';
import { useContext, useRef, useState } from 'react';
import { useApi, useMessages, useModified } from 'components/hooks';
import { TeamContext } from 'app/(main)/teams/[teamId]/TeamProvider';

const generateId = () => getRandomChars(16);

export function TeamEditForm({ teamId, allowEdit }: { teamId: string; allowEdit?: boolean }) {
  const team = useContext(TeamContext);
  const { formatMessage, labels, messages } = useMessages();
  const { post, useMutation } = useApi();
  const { mutate, error } = useMutation({
    mutationFn: (data: any) => post(`/teams/${teamId}`, data),
  });
  const ref = useRef(null);
  const [accessCode, setAccessCode] = useState(team.accessCode);
  const { showToast } = useToasts();
  const { touch } = useModified();
  const cloudMode = !!process.env.cloudMode;
  const [isFav, setIsFav] = useState(window.localStorage.getItem('umami.fav-team') === teamId);

  const handleSubmit = async (data: any) => {
    mutate(data, {
      onSuccess: async () => {
        ref.current.reset(data);
        touch('teams');
        showToast({ message: formatMessage(messages.saved), variant: 'success' });
      },
    });
  };

  const handleRegenerate = () => {
    const code = generateId();
    ref.current.setValue('accessCode', code, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setAccessCode(code);
  };

  const handleCheckIsFav = (checked: boolean) => {
    if (checked) {
      window.localStorage.setItem('umami.fav-team', String(teamId));
      setIsFav(checked);
    } else {
      setIsFav(checked);
      window.localStorage.removeItem('umami.fav-team');
    }
  };

  return (
    <Form ref={ref} onSubmit={handleSubmit} error={error} values={team}>
      <FormRow label={formatMessage(labels.teamId)}>
        <TextField value={teamId} readOnly allowCopy />
      </FormRow>
      <FormRow label={formatMessage(labels.name)}>
        {allowEdit && (
          <FormInput name="name" rules={{ required: formatMessage(labels.required) }}>
            <TextField />
          </FormInput>
        )}
        {!allowEdit && team.name}
      </FormRow>
      {!cloudMode && allowEdit && (
        <FormRow label={formatMessage(labels.accessCode)}>
          <Flexbox gap={10}>
            <TextField value={accessCode} readOnly allowCopy />
            {allowEdit && (
              <Button onClick={handleRegenerate}>{formatMessage(labels.regenerate)}</Button>
            )}
          </Flexbox>
          <Toggle checked={Boolean(isFav)} onChecked={handleCheckIsFav} style={{ marginTop: 30 }}>
            {formatMessage(labels.isFavorite)}
          </Toggle>
        </FormRow>
      )}
      {allowEdit && (
        <FormButtons>
          <SubmitButton variant="primary">{formatMessage(labels.save)}</SubmitButton>
        </FormButtons>
      )}
    </Form>
  );
}

export default TeamEditForm;
