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

class Register extends React.Component {

  constructor() {
    super();
    this.state = {
      name: "",
      email: "",
      userName: "",
      password: "",
      error: false,
      errors: []
    }
  }

  async HandlerSalvar() {   
    try {
      const {name, email, userName : user_name, password} = this.state;

      const {status} = await api.post('/users', {name, email, user_name, password});
  
      if(status === 200) {
        this.props.history.push("/auth/login");
        return;
      }

      this.setState({error: true});
    }catch ({response: {data: {errors}}}) {
      this.setState({error: true, errors})
    }

  }

  render() {
    return (
      <>
        <Col lg="5">
          <Card className="bg-secondary shadow border-0">
            <CardBody className="px-lg-5 py-lg-5">
              <div className="text-muted text-center mt-2 mb-3">
                  <h1>Cadastro</h1>
              </div>
              <div className="text-muted text-center mt-2 mb-5">
                <small>Por favor, digite suas informações no formulário abaixo para se cadastrar e acessar todas as nossas funcionalidades.</small>
              </div>

              {
                this.state.error && 
                <Alert color="danger" className="text-center mb-5">
                  <strong>Erro ao efetuar cadastro!</strong>
                  {
                    this.state.errors && this.state.errors.map((error, indice) => {
                      return <div key={indice}>{error}</div>
                    })
                  }
                </Alert>
              }
              <Form role="form">
                <FormGroup>
                  <InputGroup className="input-group-alternative mb-3">
                    <InputGroupAddon addonType="prepend">
                      <InputGroupText>
                        <i className="ni ni-hat-3" />
                      </InputGroupText>
                    </InputGroupAddon>
                    <Input onChange={(event) => this.setState({name: event.target.value, error: false})} value={this.state.name}  placeholder="Nome" type="text" autoComplete="off"/>
                  </InputGroup>
                </FormGroup>
                <FormGroup>
                  <InputGroup className="input-group-alternative mb-3">
                    <InputGroupAddon addonType="prepend">
                      <InputGroupText>
                        <i className="ni ni-email-83" />
                      </InputGroupText>
                    </InputGroupAddon>
                    <Input onChange={(event) => this.setState({email: event.target.value, error: false})} value={this.state.email}  placeholder="Email" type="email" autoComplete="off"/>
                  </InputGroup>
                </FormGroup>
                <FormGroup>
                  <InputGroup className="input-group-alternative mb-3">
                    <InputGroupAddon addonType="prepend">
                      <InputGroupText>
                        <i className="ni ni-circle-08" />
                      </InputGroupText>
                    </InputGroupAddon>
                    <Input onChange={(event) => this.setState({userName: event.target.value, error: false})} value={this.state.userName}  placeholder="Usuário" type="text" autoComplete="off"/>
                  </InputGroup>
                </FormGroup>
                <FormGroup>
                  <InputGroup className="input-group-alternative">
                    <InputGroupAddon addonType="prepend">
                      <InputGroupText>
                        <i className="ni ni-lock-circle-open" />
                      </InputGroupText>
                    </InputGroupAddon>
                    <Input onChange={(event) => this.setState({password: event.target.value, error: false})} value={this.state.password} placeholder="Senha" type="password" autoComplete="off"/>
                  </InputGroup>
                </FormGroup>
                <div className="text-center">
                  <Button onClick={() => this.HandlerSalvar()} disabled={!this.state.name.length > 0 || !this.state.email.length > 0 || !this.state.userName.length > 0 || !this.state.password.length > 0} className="mt-4" color="primary" type="button">
                    Criar conta
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

export default Register;
