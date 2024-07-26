<template>
  <div>
    <h1>SSH Public Key Converter</h1>
    <form @submit.prevent="convertKeys">
      <!-- Existing form fields -->
      <div>
        <label for="username">Username:</label>
        <input id="username" v-model="username" @input="updateAuthorizedKey"
               :class="{ 'highlight': !username && ssh2Key }" ref="username"/>
      </div>
      <div>
        <label for="comment">Comment:</label>
        <input id="comment" v-model="comment" @input="updateAuthorizedKey" ref="comment"/>
      </div>
      <div>
        <label for="ssh2">SSH2 Public Key Format:</label>
        <textarea id="ssh2" v-model="ssh2Key" @input="convertFromSSH2" ref="ssh2"></textarea>
      </div>
      <div>
        <label for="keyType">Key Type:</label>
        <select id="keyType" v-model="keyType" @change="updateAuthorizedKey" ref="keyType">
          <option value="ssh-rsa">ssh-rsa</option>
          <option value="ssh-ed25519">ssh-ed25519</option>
        </select>
      </div>
      <div>
        <label for="keyLength">Key Length:</label>
        <input id="keyLength" v-model="keyLength" type="number" @input="updateAuthorizedKey" ref="keyLength"/>
      </div>
      <div>
        <label for="authorized">OpenSSH Public Key Format:</label>
        <textarea id="authorized" v-model="authorizedKey" @input="convertFromAuthorizedKey" ref="authorized"></textarea>
      </div>
      <div>
        <label for="pem">PEM Format:</label>
        <textarea id="pem" v-model="pemKey" ref="pem"></textarea>
      </div>
      <!-- Clear Button -->
      <button type="button" @click="clearForm">Clear</button>
    </form>
  </div>
</template>

<script>
import sshpk from 'sshpk';

export default {
  data() {
    return {
      ssh2Key: '',
      authorizedKey: '',
      pemKey: '',
      username: '',
      comment: '',
      keyType: 'ssh-rsa',
      keyLength: 2048
    };
  },
  watch: {
    ssh2Key() {
      this.matchTextAreaHeights();
    },
    authorizedKey() {
      this.matchTextAreaHeights();
    },
    pemKey() {
      this.matchTextAreaHeights();
    }
  },
  methods: {
    trimInputs() {
      this.username = this.username.trim();
      this.ssh2Key = this.ssh2Key.trim();
      this.authorizedKey = this.authorizedKey.trim();
      this.comment = this.comment.trim();
    },
    convertFromSSH2() {
      this.trimInputs();
      if (!this.username) {
        this.$refs.username.focus();
        return;
      }
      if (this.ssh2Key.includes('---- BEGIN SSH2 PUBLIC KEY ----')) {
        this.convertToAuthorizedFormat();
        this.convertToPemFormat();
      }
    },
    convertToAuthorizedFormat() {
      let key = this.ssh2Key
          .replace(/---- BEGIN SSH2 PUBLIC KEY ----/, '')
          .replace(/---- END SSH2 PUBLIC KEY ----/, '')
          .replace(/Comment: ".*"/, '')
          .replace(/\n/g, '');
      this.authorizedKey = ''; // Clear the field
      if (this.keyType === 'ssh-ed25519') {
        key = key.slice(0, 44); // Ensure correct length for ed25519 keys
      }
      this.authorizedKey = `${this.keyType} ${key} ${this.comment ? this.comment + ' ' : ''}${this.username}`;
    },
    validateSSH2KeyFormat(key) {
      const ssh2KeyRegex = /---- BEGIN SSH2 PUBLIC KEY ----[\s\S]+---- END SSH2 PUBLIC KEY ----/;
      return ssh2KeyRegex.test(key);
    },
    convertToPemFormat() {
      try {
        console.log('SSH2 Key:', this.ssh2Key); // Log the input key
        if (!this.validateSSH2KeyFormat(this.ssh2Key)) {
          throw new Error('Invalid SSH2 key format');
        }
        const key = sshpk.parseKey(this.ssh2Key, 'ssh');
        this.pemKey = key.toString('pem');
        console.log('PEM Key:', this.pemKey); // Log the output key
      } catch (error) {
        console.error('Error converting to PEM format:', error);
        if (error.name === 'KeyParseError') {
          this.pemKey = 'Error: Invalid SSH2 key format';
        } else {
          this.pemKey = 'Error converting to PEM format';
        }
      }
    },
    convertFromAuthorizedKey() {
      this.trimInputs();
      const parts = this.authorizedKey.split(' ');
      if (parts.length >= 2 && (parts[0] === 'ssh-rsa' || parts[0] === 'ssh-ed25519')) {
        this.keyType = parts[0];
        this.ssh2Key = `---- BEGIN SSH2 PUBLIC KEY ----\n${parts.slice(1, -1).join(' ')}\n---- END SSH2 PUBLIC KEY ----`;
        this.username = parts[parts.length - 1];
      }
    },
    updateAuthorizedKey() {
      this.trimInputs();
      if (this.authorizedKey) {
        const parts = this.authorizedKey.split(' ');
        if (parts[0] === 'ssh-rsa' || parts[0] === 'ssh-ed25519') {
          parts[parts.length - 1] = this.username;
          this.authorizedKey = parts.join(' ');
        }
      }
      this.convertToAuthorizedFormat();
      this.convertToPemFormat();
    },
    matchTextAreaHeights() {
      this.$nextTick(() => {
        const ssh2TextArea = this.$refs.ssh2;
        const authorizedTextArea = this.$refs.authorized;
        const pemTextArea = this.$refs.pem;
        const maxHeight = Math.max(ssh2TextArea.scrollHeight, authorizedTextArea.scrollHeight, pemTextArea.scrollHeight);
        ssh2TextArea.style.height = `${maxHeight}px`;
        authorizedTextArea.style.height = `${maxHeight}px`;
        pemTextArea.style.height = `${maxHeight}px`;
      });
    },
    clearForm() {
      this.ssh2Key = '';
      this.authorizedKey = '';
      this.pemKey = '';
      this.username = '';
      this.comment = '';
      this.keyType = 'ssh-rsa';
      this.keyLength = 2048;
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
  box-sizing: border-box; /* Ensure padding is included in the width */
}

label {
  margin-bottom: 5px;
  font-weight: bold;
}

input, select, textarea {
  width: calc(100% - 20px); /* Adjust width to account for padding */
  padding: 10px;
  margin-bottom: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
  font-size: 16px;
  box-sizing: border-box; /* Ensure padding is included in the width */
}

textarea {
  resize: vertical;
  min-height: 100px;
}

.highlight {
  border: 2px solid red;
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