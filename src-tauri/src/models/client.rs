use serde::Deserialize;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateClientInput {
    pub client_code: String,
    pub client_name: String,
    pub usegali: bool,
    pub useml: bool,
    pub usexro: bool,
}