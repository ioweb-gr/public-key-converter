<template>
  <div>
    <h1>SSH Public Key Converter</h1>
    <form @submit.prevent>
      <div>
        <label for="inputData">Input:</label>
        <textarea id="inputData" v-model="inputData" @input="extractData"></textarea>
      </div>

      <div v-if="keyNameRequired">
        <label for="keyName">Key Name:</label>
        <input id="keyName" v-model="keyName" ref="keyNameInput" required />
      </div>

      <div v-if="keyNameRequired">
        <button type="button" @click="handleGenerate">Generate</button>
      </div>

      <div class="informational" v-if="!keyNameRequired">
        <div>
          <label for="keyType">Key Type:</label>
          <input id="keyType" v-model="keyType" readonly />
        </div>
        <div>
          <label for="keyData">Key Data:</label>
          <textarea id="keyData" v-model="keyData" readonly></textarea>
        </div>
        <div>
          <label for="comment">Comment:</label>
          <input id="comment" v-model="comment" readonly />
        </div>
        <div>
          <label for="keyName">Key Name:</label>
          <input id="keyName" v-model="keyName" readonly />
        </div>
      </div>

      <div class="calculated" v-if="!keyNameRequired">
        <div>
          <h2>PEM Format (PKCS#1)</h2>
          <pre>{{ pemKeyPkcs1 }}</pre>
          <div v-if="pemKeyPkcs1Error" class="error">
            <pre>{{ pemKeyPkcs1Error }}</pre>
          </div>
        </div>
        <div>
          <h2>PEM Format (PKCS#8)</h2>
          <pre>{{ pemKeyPkcs8 }}</pre>
          <div v-if="pemKeyPkcs8Error" class="error">
            <pre>{{ pemKeyPkcs8Error }}</pre>
          </div>
        </div>
        <div>
          <h2>OpenSSH Format</h2>
          <pre>{{ authorizedKey }}</pre>
          <div v-if="authorizedKeyError" class="error">
            <pre>{{ authorizedKeyError }}</pre>
          </div>
        </div>
        <div>
          <h2>RFC4253 Format</h2>
          <pre>{{ rfc4253Key }}</pre>
          <div v-if="rfc4253KeyError" class="error">
            <pre>{{ rfc4253KeyError }}</pre>
          </div>
        </div>
        <div>
          <h2>OpenSSH New Format</h2>
          <pre>{{ opensshKey }}</pre>
          <div v-if="opensshKeyError" class="error">
            <pre>{{ opensshKeyError }}</pre>
          </div>
        </div>
        <div>
          <h2>DNSSEC Format</h2>
          <pre>{{ dnssecKey }}</pre>
          <div v-if="dnssecKeyError" class="error">
            <pre>{{ dnssecKeyError }}</pre>
          </div>
        </div>
        <div>
          <h2>PuTTY Format</h2>
          <pre>{{ puttyKey }}</pre>
          <div v-if="puttyKeyError" class="error">
            <pre>{{ puttyKeyError }}</pre>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import sshpk from 'sshpk';

export default {
  data() {
    return {
      inputFormat: 'auto', // Default to auto
      inputData: '',
      keyType: '',
      keyData: '',
      comment: '',
      keyName: '',
      keyNameRequired: false,
      pemKeyPkcs1: '',
      pemKeyPkcs8: '',
      authorizedKey: '',
      rfc4253Key: '',
      opensshKey: '',
      dnssecKey: '',
      puttyKey: '',
      commentExtracted: false,
      converted: false,
      pemKeyPkcs1Error: '',
      pemKeyPkcs8Error: '',
      authorizedKeyError: '',
      rfc4253KeyError: '',
      opensshKeyError: '',
      dnssecKeyError: '',
      puttyKeyError: ''
    };
  },
  methods: {
    resetFields() {
      this.keyType = '';
      this.keyData = '';
      this.comment = '';
      this.keyName = '';
      this.pemKeyPkcs1 = '';
      this.pemKeyPkcs8 = '';
      this.authorizedKey = '';
      this.rfc4253Key = '';
      this.opensshKey = '';
      this.dnssecKey = '';
      this.puttyKey = '';
      this.pemKeyPkcs1Error = '';
      this.pemKeyPkcs8Error = '';
      this.authorizedKeyError = '';
      this.rfc4253KeyError = '';
      this.opensshKeyError = '';
      this.dnssecKeyError = '';
      this.puttyKeyError = '';
      this.keyNameRequired = false;
      this.converted = false;
    },
    extractData() {
      this.resetFields();
      try {
        const key = sshpk.parseKey(this.inputData, 'auto');
        this.keyType = key.type;
        this.keyData = key.toString('pem');
        const commentMatch = this.inputData.match(/Comment: "([^"]+)"/);
        if (commentMatch) {
          this.comment = commentMatch[1];
          this.commentExtracted = true;
        } else {
          this.commentExtracted = false;
        }
        if (!key.comment || key.comment.trim() === '' || key.comment.includes('unnamed')) {
          this.keyNameRequired = true;
        } else {
          this.keyName = key.comment;
          this.convertKeys();
        }
      } catch (error) {
        console.error('Error extracting data:', error);
      }
    },
    handleGenerate() {
      if (this.keyName) {
        this.keyNameRequired = false;
        this.proceedWithGeneration();
      } else {
        this.$refs.keyNameInput.focus();
        this.$refs.keyNameInput.classList.add('highlight');
      }
    },
    proceedWithGeneration() {
      this.convertKeys();
    },
    convertKeys() {
      try {
        const key = sshpk.parseKey(this.inputData, 'auto');

        try {
          this.pemKeyPkcs1 = key.toString('pkcs1');
        } catch (error) {
          this.pemKeyPkcs1Error = 'Error converting to PKCS#1: ' + error.message;
          console.error('Error converting to PKCS#1:', error);
        }

        try {
          this.pemKeyPkcs8 = key.toString('pkcs8');
        } catch (error) {
          this.pemKeyPkcs8Error = 'Error converting to PKCS#8: ' + error.message;
          console.error('Error converting to PKCS#8:', error);
        }

        try {
          this.authorizedKey = key.toString('ssh');
        } catch (error) {
          this.authorizedKeyError = 'Error converting to OpenSSH: ' + error.message;
          console.error('Error converting to OpenSSH:', error);
        }

        try {
          this.rfc4253Key = key.toString('rfc4253');
        } catch (error) {
          this.rfc4253KeyError = 'Error converting to RFC4253: ' + error.message;
          console.error('Error converting to RFC4253:', error);
        }

        try {
          this.opensshKey = key.toString('openssh');
        } catch (error) {
          this.opensshKeyError = 'Error converting to OpenSSH New Format: ' + error.message;
          console.error('Error converting to OpenSSH New Format:', error);
        }

        try {
          this.dnssecKey = key.toString('dnssec');
        } catch (error) {
          this.dnssecKeyError = 'Error converting to DNSSEC: ' + error.message;
          console.error('Error converting to DNSSEC:', error);
        }

        try {
          this.puttyKey = key.toString('putty');
        } catch (error) {
          this.puttyKeyError = 'Error converting to PuTTY: ' + error.message;
          console.error('Error converting to PuTTY:', error);
        }

        this.converted = true;
      } catch (error) {
        console.error('Error converting keys:', error);
      }
    }
  }
};
</script>

<style>
form {
  display: flex;
  flex-direction: column;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  background-color: #f9f9f9;
  box-sizing: border-box;
}

label {
  margin-bottom: 5px;
  font-weight: bold;
}

input, select, textarea {
  width: calc(100% - 20px);
  padding: 10px;
  margin-bottom: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
  font-size: 16px;
  box-sizing: border-box;
}

textarea {
  resize: vertical;
  min-height: 100px;
}

.informational {
  background-color: #e9f7ef;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 20px;
}

.calculated {
  background-color: #f4f4f4;
  padding: 10px;
  border-radius: 5px;
}

pre {
  background-color: #f4f4f4;
  padding: 10px;
  border-radius: 5px;
  overflow-x: auto;
}

.error {
  background-color: #f8d7da;
  color: #721c24;
  padding: 10px;
  border-radius: 5px;
  margin-top: 10px;
}

.highlight {
  border-color: red;
  box-shadow: 0 0 5px red;
}

@media (max-width: 768px) {
  form {
    padding: 10px;
  }

  input, select, textarea {
    font-size: 14px;
  }
}
</style>