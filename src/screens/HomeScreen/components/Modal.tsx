import { Button, Modal, FormControl, Input } from "native-base";
import { IUser } from "..";
//@ts-ignore
import md5 from "react-native-md5";
import React from "react";

interface Props {
  visible: boolean;
  user: IUser;
  onClose(): void;
  onSubmit(): void;
}

export const ModalSenha = ({ visible, user, onClose, onSubmit }: Props) => {
  const [pass, setPass] = React.useState("");

  const generateMD5Hash = (inputString: string) => {
    return md5.hex_md5(inputString);
  };
  const handleSubmit = () => {
    if (generateMD5Hash(pass) === user.senha) {
      onSubmit();
    } else {
      alert("Senha inválida");
    }
  };

  return (
    <Modal isOpen={visible} onClose={onClose}>
      <Modal.Content maxWidth="400px">
        <Modal.CloseButton />
        <Modal.Header>Validação de usuário</Modal.Header>
        <Modal.Body>
          <FormControl>
            <FormControl.Label>Senha</FormControl.Label>
            <Input
              type="password"
              onChangeText={(text) => {
                setPass(text);
              }}
              value={pass}
            />
          </FormControl>
        </Modal.Body>
        <Modal.Footer>
          <Button.Group space={2}>
            <Button variant="ghost" colorScheme="blueGray" onPress={onClose}>
              Cancelar
            </Button>
            <Button onPress={handleSubmit}>Presseguir</Button>
          </Button.Group>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
};
