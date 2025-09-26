require('dotenv').config();

// Script de prueba para verificar la conexión con DeepSeek API

async function testDeepSeekConnection() {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    console.error('❌ Error: DEEPSEEK_API_KEY no encontrado');
    console.log('📝 Crea un archivo .env con tu clave API:');
    console.log('   DEEPSEEK_API_KEY=tu_clave_aqui');
    return;
  }

  try {
    console.log('🔗 Probando conexión con DeepSeek API...');

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: 'Responde solo con "OK" si puedes recibir este mensaje.'
          }
        ],
        max_tokens: 10
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Conexión exitosa con DeepSeek API');
      console.log('📝 Respuesta:', data.choices[0].message.content.trim());
      console.log('🚀 ¡Listo para procesar las preguntas!');
    } else {
      console.error('❌ Error de conexión:', response.status, response.statusText);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testDeepSeekConnection();