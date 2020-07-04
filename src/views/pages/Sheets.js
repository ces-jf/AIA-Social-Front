import React from "react";

// reactstrap components
import {
    Badge,
    Card,
    CardHeader,
    DropdownMenu,
    DropdownItem,
    UncontrolledDropdown,
    DropdownToggle,
    Media,
    Table,
    Container,
    Row,
    Modal,
    Button,
    Col,
    Form,
    FormGroup,
    InputGroup,
    Input,
    Label,
    Spinner,
    CardBody,
    Tooltip,
} from "reactstrap";
// core components
import Header from "components/Headers/Header.js";
import api, {apiData} from '../../services/api';

class Sheets extends React.Component {

    constructor() {
        super();
        this.state = {
            collections: [],
            isOpenModal: false,
            loadingUpload: false,
            uploaded: false,
            categories: [],
            name: "",
            path: "",
            is_private: false,
            description: "",
            category_id: null,
            userId: null,
            isOpenModalAnalise: false,
            collectionInUse: null,
            attributes: [],
            isOpenModalResultado: false,
            resultado: "",
            limit: 1000,
            tooltipCondicao: false
        }
    }

    async componentDidMount() {

        try {
            const userId = localStorage.getItem("userId");
            this.handlerGetSheets();
            const { data: { categories } } = await api.get('/categories', { headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` } });

            this.setState({ userId, categories, category_id: categories[0].id });

        } catch {
            alert("Erro ao processar suas informações. Por favor, tente novamente.");
        }

    }

    async handlerGetSheets() {
        const { data: { result: collections } } = await api.get('/sheets', { headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` } });
        this.setState({ collections })
    }

    handlerModal() {
        this.setState({ isOpenModal: !this.state.isOpenModal });
        if (!this.state.isOpenModal) this.setState({ uploaded: false });
    }

    async handlerModalAnalise(collectionName = null) {
        
        if(collectionName !== null && !this.state.isOpenModalAnalise){
            const {data}  = await apiData.get(`data/${collectionName}`);
            this.setState({attributes: data, collectionInUse: collectionName});
        }
        
        this.setState({ isOpenModalAnalise: !this.state.isOpenModalAnalise });
    }

    handlerModalResultado() {
        this.setState({isOpenModalResultado: !this.state.isOpenModalResultado});

        if(!this.state.isOpenModalResultado) {
            this.setState({resultado: ""});
        }
    }

    async handlerAnalisar() {
        const {data: {fields, filters}}  = await apiData.post(`data/process`, this.state.attributes);
        
        const {status, data: {file}} = await api.post('/sheets/generate', {collection: this.state.collectionInUse, limit: this.state.limit, fields, filters},{ headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` } });

        if(status === 200) {
            const {data} = await apiData.get(`data/apriori/${file}`);
            this.setState({resultado: data});
            //this.handlerModalAnalise();
            this.handlerModalResultado();
        }
    }

    handlerUpdateUse(id) {
        this.setState({attributes: this.state.attributes.map(attribute => {
            if(attribute.id === id){
                attribute.use = !attribute.use;

                if(!attribute.use){
                    attribute.condition = ""
                }
            }
            return attribute;
        })})
    }

    handlerUpdateCondition(id, condition){
        this.setState({attributes: this.state.attributes.map(attribute => {
            if(attribute.id === id){
                attribute.condition = condition;
            }
            return attribute;
        })})
    }

    async handlerSalvar() {
        const { name, path, is_private, description, category_id } = this.state;

        await api.post('/sheets', { name, path, is_private, description, category_id: parseInt(category_id) }, { headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` } });

        this.handlerGetSheets();

        this.handlerModal();
    }

    async handlerUpload(file) {
        this.setState({ loadingUpload: true });
        const formData = new FormData();
        formData.append('file', file);
        const config = {
            headers: {
                'content-type': 'multipart/form-data',
                'Authorization': `Bearer ${localStorage.getItem('userToken')}`
            }
        }

        const { data: { name, path } } = await api.post('/uploads', formData, config);

        this.setState({ loadingUpload: false, uploaded: true, name, path });

    }

    async handlerPrivate(idCollection, isPrivate) {
        await api.put('/sheets', { idCollection, isPrivate }, { headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` } });
        this.handlerGetSheets();
    }

    render() {
        return (
            <>
                <Header />
                {/* Page content */}
                <Container className="mt--7" fluid>
                    {/* Table */}
                    <Row>
                        <div className="col">
                            <Card className="shadow">
                                <CardHeader className="border-0 d-flex justify-content-between align-items-center">
                                    <h3 className="mb-0">Suas planilhas</h3>
                                    <Button onClick={() => this.handlerModal()} color="success" type="button" className="d-flex align-items-center">
                                        <i className="ni ni-cloud-upload-96 text-white mr-2" />Upload
                                    </Button>
                                </CardHeader>
                                <Table className="align-items-center table-flush" responsive>
                                    <thead className="thead-light">
                                        <tr>
                                            <th scope="col">Planilha</th>
                                            <th scope="col">Descrição</th>
                                            <th scope="col">Status</th>
                                            <th scope="col">Categoria</th>
                                            <th scope="col">Público</th>
                                            <th scope="col" />
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {this.state.collections.map(collection => {
                                            return (
                                                <tr key={collection.id}>
                                                    <th scope="row">
                                                        <Media className="align-items-center">
                                                            <img
                                                                alt="..."
                                                                className="avatar mr-3"
                                                                src={require("assets/img/theme/sheets.svg")}
                                                            />
                                                            <Media>
                                                                <span className="mb-0 text-sm">
                                                                    {collection.name}
                                                                </span>
                                                            </Media>
                                                        </Media>
                                                    </th>
                                                    <td>{collection.description}</td>
                                                    <td>
                                                        <Badge color="" className="badge-dot mr-4">
                                                            {collection.status === "Sucesso" ? <i className="bg-success" /> : (collection.status === "Enviado" ? <i className="bg-primary" /> : <i className="bg-danger" />)}
                                                            {collection.status}
                                                        </Badge>
                                                    </td>
                                                    <td>{collection.category.name}</td>
                                                    <td>{collection.is_private ? <span className="text-danger">Não</span> : <span className="text-success">Sim</span>}</td>
                                                    <td className="text-right">
                                                        <UncontrolledDropdown>
                                                            <DropdownToggle
                                                                className="btn-icon-only text-light bg-white"
                                                                role="button"
                                                                size="sm"
                                                                color=""
                                                                onClick={e => e.preventDefault()}
                                                            >
                                                                <i className="fas fa-ellipsis-v" />
                                                            </DropdownToggle>
                                                            <DropdownMenu className="dropdown-menu-arrow" right>
                                                                {
                                                                    collection.status === "Sucesso" &&
                                                                    <DropdownItem
                                                                        onClick={() => this.handlerModalAnalise(collection.collection_name)}
                                                                    >
                                                                        Analisar
                                                                    </DropdownItem>
                                                                }
                                                                {
                                                                    parseInt(this.state.userId) === parseInt(collection.user_id) &&
                                                                    <DropdownItem
                                                                        onClick={() => this.handlerPrivate(collection.id, collection.is_private)}
                                                                    >
                                                                        {collection.is_private ? "Tornar público" : "Tornar privado"}
                                                                    </DropdownItem>
                                                                }
                                                            </DropdownMenu>
                                                        </UncontrolledDropdown>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </Table>
                            </Card>
                        </div>
                    </Row>

                    {/***** Modal de upload *****/}
                    <Modal isOpen={this.state.isOpenModal}>
                        <div className="modal-header">
                            <h5 className="modal-title text-uppercase">
                                Importar base de dados
                            </h5>
                        </div>
                        <div className="modal-body">
                            <Form role="form">
                                <FormGroup className="mb-3 d-flex align-items-center" row>
                                    <Label for="importFile" sm={2}>Planilha</Label>
                                    <Col sm={8}>
                                        <Input id="importFile" disabled={this.state.uploaded} onChange={event => this.handlerUpload(event.target.files[0])} accept=".csv" type="file" name="file" />
                                    </Col>
                                    <Col className="d-flex align-items-center justify-content-end" sm={2}>
                                        {this.state.loadingUpload && <Spinner animation="border" size="sm" />}
                                    </Col>
                                </FormGroup>

                                <FormGroup row>
                                    <Col md={9}>
                                        <InputGroup className="input-group-alternative">
                                            <Input onChange={event => this.setState({ category_id: event.target.value })} disabled={!this.state.uploaded} type="select" name="select">
                                                {
                                                    this.state.categories.map(category => (
                                                        <option value={category.id} key={category.id}>{category.name}</option>
                                                    ))
                                                }
                                            </Input>
                                        </InputGroup>
                                    </Col>
                                    <Col md={3}>
                                        <div className="custom-control custom-control-alternative custom-checkbox">
                                            <input
                                                disabled={!this.state.uploaded}
                                                className="custom-control-input"
                                                id="isPrivate"
                                                type="checkbox"
                                                onChange={() => this.setState({ is_private: !this.state.is_private })}
                                                checked={this.state.is_private}
                                            />
                                            <label className="custom-control-label" htmlFor="isPrivate">
                                                Privado
                                            </label>
                                        </div>
                                    </Col>
                                </FormGroup>

                                <FormGroup className="mb-3">
                                    <InputGroup className="input-group-alternative">
                                        <Input onChange={event => this.setState({ description: event.target.value })} disabled={!this.state.uploaded} placeholder="Descrição" type="text" autoComplete="off" />
                                    </InputGroup>
                                </FormGroup>
                            </Form>
                        </div>
                        <div className="modal-footer">
                            <Button
                                onClick={() => this.handlerModal()}
                                color="secondary"
                                data-dismiss="modal"
                                type="button"
                            >
                                Cancelar
                            </Button>
                            <Button onClick={() => this.handlerSalvar()} color="success" type="button">
                                Salvar informações
                            </Button>
                        </div>
                    </Modal>

                    {/***** Modal de upload *****/}
                    <Modal isOpen={this.state.isOpenModalAnalise} size="lg">
                        <div className="modal-header">
                            <h5 className="modal-title text-uppercase">
                                Analisar base de dados
                            </h5>
                        </div>
                        <Row>
                            <div className="col">
                                <Card className="shadow">
                                    <CardHeader className="border-0 d-flex justify-content-between">
                                        <h3 className="mb-0">Opções de filtro</h3>

                                        <Col lg="4">
                                            <InputGroup className="input-group-alternative">
                                                <Input onChange={event => this.setState({ limit: event.target.value })} type="select" name="select">
                                                    <option value={1000}>1.000 registros</option>
                                                    <option value={5000}>5.000 registros</option>
                                                    <option value={10000}>10.000 registros</option>
                                                    <option value={15000}>15.000 registros</option>
                                                    <option value={20000}>20.000 registros</option>
                                                    <option value={25000}>25.000 registros</option>
                                                    <option value={30000}>30.000 registros</option>

                                                </Input>
                                            </InputGroup>
                                        </Col>
                                    </CardHeader>
                                    <Table className="align-items-center table-flush" responsive>
                                        <thead className="thead-light">
                                            <tr>
                                                <th scope="col">Filtro</th>
                                                <th scope="col">Atributo</th>
                                                <th scope="col">
                                                    <span id="condicao-span">Condição</span>
                                                    <i className="fa fa-question-circle ml-1 text-primary" onMouseOver={() => this.setState({tooltipCondicao: true})} onMouseOut={() => this.setState({tooltipCondicao: false})}/>
                                                    <Tooltip target={`condicao-span`} isOpen={this.state.tooltipCondicao}>
                                                        Consulte o dicionário da sua base de dados e informe um valor válido para ser procurado
                                                    </Tooltip>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {this.state.attributes.map((attribute, indice) => {
                                                return (
                                                    <tr key={attribute.id}>
                                                        <td>
                                                            <div className="custom-control custom-control-alternative custom-checkbox">
                                                                <input
                                                                    className="custom-control-input"
                                                                    id={`isPrivate${attribute.id}`}
                                                                    type="checkbox"
                                                                    onChange={() => this.handlerUpdateUse(attribute.id)}
                                                                    checked={this.state.attributes[indice].use}
                                                                />
                                                                <label className="custom-control-label" htmlFor={`isPrivate${attribute.id}`}>
                                                                    Utilizar
                                                                </label>
                                                            </div>
                                                        </td>
                                                        <td>{attribute.name}</td>
                                                        <td>
                                                            <FormGroup className="mb-0">
                                                                <InputGroup className="input-group-alternative">
                                                                    <Input value={this.state.attributes[indice].condition} onChange={(event) => this.handlerUpdateCondition(attribute.id, event.target.value)} placeholder="Consulte sua base de dados" type="text" autoComplete="off" />
                                                                </InputGroup>
                                                            </FormGroup>
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </Table>
                                </Card>
                            </div>
                        </Row>
                        <div className="modal-footer">
                            <Button
                                onClick={() => this.handlerModalAnalise()}
                                color="secondary"
                                data-dismiss="modal"
                                type="button"
                            >
                                Cancelar
                            </Button>
                            <Button onClick={() => this.handlerAnalisar()} color="success" type="button">
                                Analisar informações
                            </Button>
                        </div>
                    </Modal>

                    {/***** Modal de resultados *****/}
                    <Modal isOpen={this.state.isOpenModalResultado} size="lg">
                        <div className="modal-header">
                            <h5 className="modal-title text-uppercase">
                                Resultados da análise
                            </h5>
                        </div>
                        <Row>
                            <div className="col">
                                <Card className="shadow">
                                    <CardHeader className="border-0">
                                        <h3 className="mb-0">Resultados</h3>
                                    </CardHeader>
                                    <CardBody>
                                        {this.state.resultado.split('\n').map((result, indice) => {
                                            
                                            if(result === "Best rules found:"){
                                                return <p key={indice}><strong>{result}</strong></p>
                                            }

                                            return <p key={indice}>{result}</p>
                                        })}
                                    </CardBody>
                                </Card>
                            </div>
                        </Row>
                        <div className="modal-footer">
                            <Button
                                onClick={() => this.handlerModalResultado()}
                                color="secondary"
                                data-dismiss="modal"
                                type="button"
                            >
                                Fechar
                            </Button>
                        </div>
                    </Modal>
                </Container>
            </>
        );
    }
}

export default Sheets;
