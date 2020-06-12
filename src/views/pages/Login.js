import React from "react";
import api from "../../services/api";


// reactstrap components
import {
  Button,
  Card,
  CardBody,
  FormGroup,
  Form,
  Input,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
  Col,
  Alert
} from "reactstrap";

class Login extends React.Component {

  constructor() {
    super();
    this.state = {
      userNameOrEmail : "",
      password: "",
      error: false,
    }
  }

  async handlerLogin() {
    try {
      const {userNameOrEmail, password} = this.state;

      const {status, data} = await api.post('/sessions', {userNameOrEmail, password});
  
      if(status === 200) {
        const {token, user: {name, id}} = data;

        localStorage.clear();
        localStorage.setItem("userId", id);
        localStorage.setItem("userName", name);
        localStorage.setItem("userToken", token);

        this.props.history.push("/admin/sheets");

        return;
      }

      this.setState({error: true});
    }catch {
      this.setState({error: true})
    }

  }

  render() {
    return (
      <>
        <Col lg="5">
          <Card className="bg-secondary shadow border-0">
            <CardBody className="px-lg-5 py-lg-5">
              <div className="text-muted text-center mt-2 mb-3">
                  <h1>Login</h1>
              </div>
              <div className="text-muted text-center mt-2 mb-5">
                <small>Por favor, informe suas credencias abaixo para ter acesso as nossas funcionalidades.</small>
              </div>

              {
                this.state.error && 
                <Alert color="danger" className="text-center mb-5">
                  <strong>Erro ao efetuar login!</strong>
                  <br />
                  Por favor, verifique suas credenciais.
                </Alert>
              }
              <Form role="form">
                <FormGroup className="mb-3">
                  <InputGroup className="input-group-alternative">
                    <InputGroupAddon addonType="prepend">
                      <InputGroupText>
                        <i className="ni ni-email-83" />
                      </InputGroupText>
                    </InputGroupAddon>
                    <Input onChange={event => this.setState({userNameOrEmail: event.target.value, error: false})} value={this.state.userNameOrEmail} placeholder="Usuário ou e-mail" type="email" autoComplete="new-email"/>
                  </InputGroup>
                </FormGroup>
                <FormGroup>
                  <InputGroup className="input-group-alternative">
                    <InputGroupAddon addonType="prepend">
                      <InputGroupText>
                        <i className="ni ni-lock-circle-open" />
                      </InputGroupText>
                    </InputGroupAddon>
                    <Input onChange={event => this.setState({password: event.target.value, error: false})} value={this.state.password} placeholder="Senha" type="password" autoComplete="off"/>
                  </InputGroup>
                </FormGroup>
                <div className="text-center">
                  <Button onClick={() => this.handlerLogin()} disabled={!this.state.password.length > 0 || !this.state.userNameOrEmail.length > 0} className="my-4" color="primary" type="button">
                    Entrar
                  </Button>
                </div>
              </Form>
            </CardBody>
          </Card>
        </Col>
      </>
    );
  }
}

export default Login;
