import { SvcContainer, StartedSvcContainer } from '../basic/onecx-svc'
import { StartedOnecxKeycloakContainer } from '../core/onecx-keycloak'
import { StartedOnecxPostgresContainer } from '../core/onecx-postgres'

export class ParameterSvcContainer extends SvcContainer {
  constructor(
    image: string,
    databaseContainer: StartedOnecxPostgresContainer,
    keycloakContainer: StartedOnecxKeycloakContainer
  ) {
    super(image, { databaseContainer, keycloakContainer })
    this.withEnvironment({
      TKIT_RS_CONTEXT_TENANT_ID_ENABLED: 'false',
    })
    this.withNetworkAliases('onecx-parameter-svc')
      .withDatabaseUsername('onecx_parameter')
      .withDatabasePassword('onecx_parameter')
  }
}

export class StartedParameterSvcContainer extends StartedSvcContainer {}
